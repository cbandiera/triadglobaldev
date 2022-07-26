gs.include('OperatingSystemParser');

var OperatingSystemUtil = Class.create();

OperatingSystemUtil.prototype = {

    _runsOnParentField: 'Runs On',
    _runsOnChildField: 'Runs',
    _runsOnRelationshipName: 'Runs On::Runs',
    _entitledToParentField: 'Entitled to',
    _entitledToChildField: 'Allowed for',

    osParser: new OperatingSystemParser(),
    appleParser: new OperatingSystemAppleParser(),
    linuxParser: new OperatingSystemLinuxParser(),
    windowsParser: new OperatingSystemWinParser(),
    genericParser: new OperatingSystemGenericParser(),
    osUtilInternal: new OperatingSystemInternal(),

    /**SNDOC
    @name getOrCreateOperatingSystemModel
	@description Used by the ETL to determine the Operating System
    @param {string} [name] - (mandatory) the name of the operating system
    @param {string} [version] - (mandatory) the version of the operating system
    @param {string} [type] - the type of the operating system (Mac, Windows, Linux, Unix, iOS, Androide, Generic)
    @return {string} sys_id of the vendor concatenated with the sys_id of operating system model
    */
    getOrCreateOperatingSystemModel: function (name, version, type) {
        if (!name) throw new Error('Invalid null argument for the parameter name in the getOrCreateOperatingSystemModel operation in the class OperatingSystemUtil');
        if (!version) throw new Error('Invalid null argument for the parameter version in the getOrCreateOperatingSystemModel operation in the class OperatingSystemUtil');

        if (!type) {
            type = this.osParser.cleanseOperatingSystemType(name);
        }

        var sysID = '';

        var grOSModel = this.osParser.getOperatingSystemModel(type, name, version);

        if (!grOSModel) grOSModel = this.osParser.createOperatingSystemModel(type, name, version);

        if (grOSModel) return grOSModel.getUniqueValue();

        return sysID + '';
    },
    /**SNDOC
    @name parseIntuneOS
    @description Get operating system parameter based on the intune payload
    @param {string} [operatingsystem] - operating system name
    @param {string} [osversion] - OS version
    @return {string} sys id of operating system model 
        */
    parseIntuneOS: function (operatingsystem, osversion) {
        var type = this.osParser.cleanseOperatingSystemType(operatingsystem);
        var name = operatingsystem;
        var osModel;
        if (type != this.windowsParser.OsType_windows) {
            try {
                osModel = this.osParser.getOperatingSystemModel(type, name, osversion);
            } catch (error) {
                return null;
            }
        } else {
            osModel = this.osParser.createOperatingSystemModel(type, name, osversion);
        }
        if (osModel) {
            return osModel.getUniqueValue();
        }
        return null;
    },
    /**SNDOC
    @name parseJamfOS
    @description Get operating system parameter based on the jamf payload (jamf only has Mac machines)
    @param {string} [os_name] - operating system name
    @param {string} [os_version] - OS version
    @param {string} [os_build] - OS build
    @return {string} sys id of operating system model 
        */
    parseJamfOS: function (os_name, os_version, os_build) {
        try {
            var grOs = this.appleParser.getMacOperatingSystemModel({
                build: os_build
            });
            if (!grOs) {
                var objVersion = this.appleParser.decomposeAppleVersion(os_version);
                objVersion.build = os_build;
                grOs = this.appleParser.createMacOperatingSystemModel(objVersion);
            }
            return grOs.sys_id;
        } catch (error) {
            gs.error(error.message + ' ' + os_version + ' ' + os_build);
        }
        return null;
    },
    /**SNDOC
    @name paseCrowdstrikeOS
    @description Get operating system parameter from crowdstrike payload
    @param {integer} [platformID] - 0=Win 1=Mac 3=Linux
    @param {string} [osVersion] - version string
    @param {string} [osBuild] - OS Build string
    @param {string} [productType] - "Server" / "Workstation"
    @return {string} sys id of operating system model 
     */
    parseCrowdstrikeOS: function (platformID, osVersion, osBuild, productType) {
        var type, grOS;
        if (platformID == 3) { // Linux
            var name = osVersion + ' ' + productType;
            var decomposed = this.linuxParser.decomposeLinuxVersion(name, osVersion);
            if (decomposed.review) delete decomposed['review'];
            if (decomposed.build) delete decomposed['build'];
            grOS = this.linuxParser.getLinuxOperatingSystemModel(name, decomposed);
        } else {
            if (platformID == 1) { // Mac
                try {
                    grOS = this.appleParser.getMacOperatingSystemModel({
                        build: osBuild
                    });
                    if (!grOS) {
                        var objVersion = this.appleParser.decomposeAppleVersion(osVersion);
                        objVersion.build = osBuild;
                        grOS = this.appleParser.getMacOperatingSystemModel(objVersion);
                    }
                } catch (error) {
                    gs.error(error.message + ' ' + osVersion + ' ' + osBuild);
                }
            } else {
                if (platformID == 0) { // Windows
                    type = this.windowsParser.OsType_windows;
                    grOS = this.osUtilInternal.getOperatingSystemModelInternal(type, null, null, null, osBuild);
                }
            }
        }
        if (grOS) return grOS.getUniqueValue();
        return null;
    },
    /**SNDOC
    @name createRunsOnRelationship
	@description Creates the Runs On relationship between operating system CI and computer CI
    @param {string} [operatingSystemCISysId] - (mandatory) The operating system CI sys_id
    @param {string} [computerCISysId] - (mandatory) The computer CI sys_id
    @return {string} The sys_id of the relationship created
    */
    createRunsOnRelationship: function (operatingSystemCISysId, computerCISysId) {
        if (!operatingSystemCISysId) throw new Error('Invalid null argument for the parameter operatingSystemCISysId in the createRunsOnRelationship operation in the class OperatingSystemUtil');
        if (!computerCISysId) throw new Error('Invalid null argument for the parameter computerCISysId in the createRunsOnRelationship operation in the class OperatingSystemUtil');
        if (this.checkRunsOnRelationship(operatingSystemCISysId, computerCISysId)) throw new Error('The relationship already exists in the createRunsOnRelationship operation in the class OperatingSystemUtil');

        var cmdbUtil = new SNC.CMDBUtil();
        return cmdbUtil.createCIRelationship(operatingSystemCISysId, computerCISysId, this._runsOnParentField, this._runsOnChildField);
    },
    /**SNDOC
    @name checkRunsOnRelationship
	@description Checks the existence of Runs On relationship between operation system CI and computer CI
    @param {string} [operatingSystemCISysId] - (mandatory) The operating system CI sys_id
    @param {string} [computerCISysId] - (mandatory) The computer CI sys_id
    @return {boolean} The boolean representing the existence of the relationship
    */
    checkRunsOnRelationship: function (operatingSystemCISysId, computerCISysId) {
        if (!operatingSystemCISysId) throw new Error('Invalid null argument for the parameter operatingSystemCISysId in the createRunsOnRelationship operation in the class OperatingSystemUtil');
        if (!computerCISysId) throw new Error('Invalid null argument for the parameter computerCISysId in the createRunsOnRelationship operation in the class OperatingSystemUtil');

        var grRelCI = new GlideRecord('cmdb_rel_ci');
        grRelCI.addQuery('parent', operatingSystemCISysId);
        grRelCI.addQuery('child', computerCISysId);
        grRelCI.addQuery('name', this._getRunsOnRelationshipName());
        grRelCI.query();
        return grRelCI.next();
    },
    /**SNDOC
    @name updateOperatingSystemModelVersion
    @param {GlideRecord} [grOperatingSystemModel] - (mandatory) The Operating System Model Glide Record
	@description Updates the version with a composed version string
    */
    updateOperatingSystemModelVersion: function (grOperatingSystemModel) {
        if (!grOperatingSystemModel) throw new Error('Invalid null argument for the parameter grOperatingSystemModel in the updateOperatingSystemModelVersion operation in the class OperatingSystemUtil');

        var version = this.osParser.composeVersion(
            grOperatingSystemModel.getValue('type'),
            grOperatingSystemModel.getValue('major_version'),
            grOperatingSystemModel.getValue('minor_version'),
            grOperatingSystemModel.getValue('review_version'),
            grOperatingSystemModel.getValue('build_version'),
            grOperatingSystemModel.getValue('u_product_lifecycle_management_policy'),
            null,
            null);

        if (version) grOperatingSystemModel.setValue('version', version);

    },
    /**SNDOC
    @name updateOperatingSystemModelDisplayName
    @param {GlideRecord} [grOperatingSystemModel] - (mandatory) The Operating System Model Glide Record
	@description Updates the display name for some operating system
    */
    updateOperatingSystemModelDisplayName: function (grOperatingSystemModel) {
        if (!grOperatingSystemModel) throw new Error('Invalid null argument for the parameter grOperatingSystemModel in the updateOperatingSystemModelDisplayName operation in the class OperatingSystemUtil');
        var displayName = '';
        switch (grOperatingSystemModel.getValue('type')) {
            case this.windowsParser.OsType_windows:
                displayName = this.windowsParser.composeWindowsDisplayNameInternal(
                    grOperatingSystemModel.manufacturer.name.getValue(),
                    grOperatingSystemModel.getValue('name'),
                    grOperatingSystemModel.getValue('edition'),
                    grOperatingSystemModel.getValue('version'),
                    grOperatingSystemModel.getValue('u_version_alias'),
                    grOperatingSystemModel.getValue('u_product_lifecycle_management_policy'));

                if (displayName) grOperatingSystemModel.setValue('display_name', displayName);
                break;

            default:
                displayName = this.genericParser.composeGenericDisplayName(
                    grOperatingSystemModel.manufacturer.name.getValue(),
                    grOperatingSystemModel.getValue('name'),
                    grOperatingSystemModel.getValue('edition'),
                    grOperatingSystemModel.getValue('version'));

                if (displayName) grOperatingSystemModel.setValue('display_name', displayName);
                break;
        }
    },
    /**SNDOC
    @name updateOperatingSystemCIbyModel
    @param {GlideRecord} [grOperatingSystemCI] - (mandatory) The CI Glide Record
	@description Replicates fields from OperatingSystem Model to the CIxModel record
    */
    updateOperatingSystemCIbyModel: function (grOperatingSystemCI) {
        if (!grOperatingSystemCI) throw new Error('Invalid null argument for the parameter grOperatingSystemCI in the updateOperatingSystemModelDisplayName operation in the class OperatingSystemUtil');
        if (!grOperatingSystemCI.model_id.nil()) {
            grOperatingSystemCI.setValue('u_operating_system_name', grOperatingSystemCI.model_id.display_name.getValue());
            grOperatingSystemCI.setValue('manufacturer', grOperatingSystemCI.model_id.manufacturer.getValue());
            grOperatingSystemCI.setValue('name', grOperatingSystemCI.model_id.display_name.getValue());
            grOperatingSystemCI.setValue('vendor', grOperatingSystemCI.model_id.manufacturer.getValue());
            grOperatingSystemCI.setValue('version', grOperatingSystemCI.model_id.version.getValue());
            grOperatingSystemCI.setValue('install_count', 1);
            if (grOperatingSystemCI.install_date.nil()) {
                grOperatingSystemCI.setValue('install_date', new GlideDateTime());
            }
            if (!grOperatingSystemCI.u_cmdb_ci.nil()) {
                grOperatingSystemCI.setValue('key', grOperatingSystemCI.u_cmdb_ci.getValue() + '_:::_' + grOperatingSystemCI.model_id.name.getValue() + '_:::_' + grOperatingSystemCI.model_id.version.getValue() + '_:::_1');
            } else {
                grOperatingSystemCI.setValue('key', '');
            }
        }
    },
    /**SNDOC
    @name createEntitledToRelationship
	@description Creates the Entitled To::Allowed for relationship between operating system CI and computer CI
    @param {string} [computerCISysId] - (mandatory) The computer CI sys_id
    @param {string} [softwareModelSysId] - (mandatory) The software model sys_id
    @return {string} The sys_id of the relationship created
    */
    createEntitledToRelationship: function (computerCISysId, softwareModelSysId) {
        if (!computerCISysId) throw new Error('Invalid null argument for the parameter computerCISysId in the createEntitledToRelationship operation in the class OperatingSystemUtil');
        if (!softwareModelSysId) throw new Error('Invalid null argument for the parameter softwareModelSysId in the createEntitledToRelationship operation in the class OperatingSystemUtil');
        if (this.checkEntitledToRelationship(computerCISysId, softwareModelSysId)) throw new Error('The relationship already exists in the createEntitledToRelationship operation in the class OperatingSystemUtil');

        var entitledToRelsysId = this._getEntitledToRelationshipSysId();
        if (entitledToRelsysId) {
            var grRelCI = new GlideRecord('u_cmdb_rel_software_product_model');
            grRelCI.initialize();
            grRelCI.setValue('u_ci', computerCISysId);
            grRelCI.setValue('u_software_model', softwareModelSysId);
            grRelCI.setValue('u_type', entitledToRelsysId);
            return grRelCI.insert();
        }
    },
    /**SNDOC
    @name checkEntitledToRelationship
	@description Creates the Entitled To::Allowed for relationship between operating system CI and computer CI
    @param {string} [computerCISysId] - (mandatory) The computer CI sys_id
    @param {string} [softwareModelSysId] - (mandatory) The software model sys_id
    @return {boolean} The boolean representing the existence of the relationship
    */
    checkEntitledToRelationship: function (computerCISysId, softwareModelSysId) {
        if (!computerCISysId) throw new Error('Invalid null argument for the parameter computerCISysId in the checkEntitledToRelationship operation in the class OperatingSystemUtil');
        if (!softwareModelSysId) throw new Error('Invalid null argument for the parameter softwareModelSysId in the checkEntitledToRelationship operation in the class OperatingSystemUtil');

        var entitledToRelsysId = this._getEntitledToRelationshipSysId();
        if (entitledToRelsysId) {
            var grRelCI = new GlideRecord('u_cmdb_rel_software_product_model');
            grRelCI.addQuery('u_ci', computerCISysId);
            grRelCI.addQuery('u_software_model', softwareModelSysId);
            grRelCI.addQuery('u_type', entitledToRelsysId);
            grRelCI.query();
            return grRelCI.next();
        }
        return false;
    },
    /**SNDOC
    @name getRunsOnRelationshipName
	@description Gets Runs On::Runs for relationship name
    @return {boolean} The Runs On::Runs relationship name
    */
    _getRunsOnRelationshipName: function () {
        return this._runsOnParentField + '::' + this._runsOnChildField;
    },
    /**SNDOC
    @name getEntitledToRelationshipName
	@description Gets the Entitled To::Allowed For relationship name
    @return {string} The Entitled To::Allowed For relationship name
    */
    _getEntitledToRelationshipName: function () {
        return this._entitledToParentField + '::' + this._entitledToChildField;
    },
    /**SNDOC
    @name getEntitledToRelationshipSysId
	@description Gets the Entitled To::Allowed For relationship sys_id
    @return {string} The Entitled To::Allowed For relationship sys_id
    */
    _getEntitledToRelationshipSysId: function () {
        var grRelType = new GlideRecord('u_cmdb_rel_software_product_model_type');
        if (grRelType.get('name', this._getEntitledToRelationshipName())) {
            return grRelType.sys_id.getValue();
        }
        return null;
    },
    /**SNDOC
    @name updateOperatingSystemEmptyKey
	@description Update the empty key of operating system CIs
    */
    updateOperatingSystemEmptyKey: function () {
        var grOperatingSystem = new GlideRecord('u_cmdb_ci_operating_system');
        grOperatingSystem.addEncodedQuery('keyISEMPTY');
        grOperatingSystem.query();
        while (grOperatingSystem.next()) {
            this.updateOperatingSystemCIbyModel(grOperatingSystem);
            grOperatingSystem.update();
        }
    },
    /**SNDOC
    @name setComputerOperatingSystemFlags
	@description Set the operating system flag for Linux, Windows and/or Mac
    @param {string} [computerCISysId] - (mandatory) The computer CI sys_id
    @param {string} [type] - (mandatory) The operating system type added to the computer
    */
    setComputerOperatingSystemFlags: function (computerCISysId, type) {
        if (!computerCISysId) throw new Error('Invalid null argument for the parameter computerCISysId in the setComputerOperatingSystemFlags operation in the class OperatingSystemUtil');
        if (!type) throw new Error('Invalid null argument for the parameter type in the setComputerOperatingSystemFlags operation in the class OperatingSystemUtil');

        var grComputer = new GlideRecord('cmdb_ci_computer');
        if (grComputer.get(computerCISysId)) {
            if ((type == this.linuxParser.OsType_linux) && !grComputer.u_has_linux) {
                grComputer.u_has_linux = true;
                grComputer.update();
                gs.info('Set Has Linux');
            } else if ((type == this.windowsParser.OsType_windows) && !grComputer.u_has_windows) {
                grComputer.u_has_windows = true;
                grComputer.update();
                gs.info('Set Has Windows');
            } else if ((type == this.appleParser.OsType_mac) && !grComputer.u_has_mac) {
                grComputer.u_has_mac = true;
                grComputer.update();
                gs.info('Set Has macOs');
            }
        }
    },
    /**SNDOC
    @name checkAndUnsetComputerOperatingSystemFlags
	@description Set the operating system flag for Linux, Windows and/or Mac
    @param {string} [computerCISysId] - (mandatory) The computer CI sys_id
    @param {string} [removedOperatingSystemSysId] - (mandatory) The operating system CI sys_id removed
    @param {string} [type] - (mandatory) The operating system type removed from the computer
    */
    checkAndUnsetComputerOperatingSystemFlags: function (computerCISysId, removedOperatingSystemSysId, type) {
        if (!computerCISysId) throw new Error('Invalid null argument for the parameter computerCISysId in the checkAndUnsetComputerOperatingSystemFlags operation in the class OperatingSystemUtil');
        if (!removedOperatingSystemSysId) throw new Error('Invalid null argument for the parameter removedOperatingSystemSysId in the checkAndUnsetComputerOperatingSystemFlags operation in the class OperatingSystemUtil');
        if (!type) throw new Error('Invalid null argument for the parameter type in the checkAndUnsetComputerOperatingSystemFlags operation in the class OperatingSystemUtil');

        var grOS = new GlideRecord('u_cmdb_ci_operating_system');
        grOS.addQuery('u_cmdb_ci', computerCISysId);
        grOS.addQuery('sys_id', '!=', removedOperatingSystemSysId);
        grOS.addQuery('model_id.type', type);
        grOS.query();
        if (!grOS.next()) {
            var grComputer = new GlideRecord('cmdb_ci_computer');
            if (grComputer.get(computerCISysId)) {
                if ((type == this.linuxParser.OsType_linux) && grComputer.u_has_linux) {
                    grComputer.u_has_linux = false;
                    grComputer.update();
                } else if ((type == this.windowsParser.OsType_windows) && grComputer.u_has_windows) {
                    grComputer.u_has_windows = false;
                    grComputer.update();
                } else if ((type == this.appleParser.OsType_mac) && grComputer.u_has_mac) {
                    grComputer.u_has_mac = false;
                    grComputer.update();
                }
            }
        }
    },
    /**SNDOC
    @name checkAndSetFlagLastUpdatedOS
	@description Set the operating system flag for Linux, Windows and/or Mac for all computers updated in the last 15 minutes
    */
    checkAndSetFlagLastUpdatedOS: function () {
        var grOperatingSystem = new GlideRecord('u_cmdb_ci_operating_system');
        grOperatingSystem.addEncodedQuery('sys_updated_onONLast 15 minutes@javascript:gs.beginningOfLast15Minutes()@javascript:gs.endOfLast15Minutes()');
        grOperatingSystem.query();
        while (grOperatingSystem.next()) {
            var computerCISysId = grOperatingSystem.u_cmdb_ci.getValue();
            var type = grOperatingSystem.model_id.type.getValue();
            this.setComputerOperatingSystemFlags(computerCISysId, type);
        }
    },
    type: 'OperatingSystemUtil',
};