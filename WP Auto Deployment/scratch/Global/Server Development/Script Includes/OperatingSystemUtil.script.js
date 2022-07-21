/* global SNC */

var OperatingSystemUtil = Class.create();
OperatingSystemUtil.prototype = {
    initialize: function () {},
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
        grRelCI.addQuery('name', this.getRunsOnRelationshipName());
        grRelCI.query();
        return grRelCI.next();
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

        var entitledToRelsysId = this.getEntitledToRelationshipSysId();
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

        var entitledToRelsysId = this.getEntitledToRelationshipSysId();
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
    getRunsOnRelationshipName: function () {
        return this._runsOnParentField + '::' + this._runsOnChildField;
    },
    /**SNDOC
    @name getEntitledToRelationshipName
	@description Gets the Entitled To::Allowed For relationship name
    @return {string} The Entitled To::Allowed For relationship name
    */
    getEntitledToRelationshipName: function () {
        return this._entitledToParentField + '::' + this._entitledToChildField;
    },
    /**SNDOC
    @name getEntitledToRelationshipSysId
	@description Gets the Entitled To::Allowed For relationship sys_id
    @return {string} The Entitled To::Allowed For relationship sys_id
    */
    getEntitledToRelationshipSysId: function () {
        var grRelType = new GlideRecord('u_cmdb_rel_software_product_model_type');
        if (grRelType.get('name', this.getEntitledToRelationshipName())) {
            return grRelType.sys_id.getValue();
        }
        return null;
    },
    cleanseOperatingSystemType: function (name) {
        var osTypePattern = /\b(WINDOWS|MAC|MACOS|IOS|UNIX|LINUX|UBUNTU|UNIX|ANDROID)/ig;
        var osTypeMatch = osTypePattern.exec(name);
        if (osTypeMatch) {
            var osTypeFound = osTypeMatch[1].toUpperCase();
            switch (osTypeFound) {
                case this._osTypes.Windows.toUpperCase():
                    return this._osTypes.Windows;

                case this._osTypes.Linux.toUpperCase():
                case this._ubuntuLinuxOSName.toUpperCase():
                    return this._osTypes.Linux;

                case this._osTypes.Android.toUpperCase():
                    return this._osTypes.Android;

                case this._osTypes.Unix.toUpperCase():
                    return this._osTypes.Unix;

                case this._osTypes.iOS.toUpperCase():
                    return this._osTypes.iOS;

                case this._osTypes.Mac.toUpperCase():
                case 'MACOS':
                    return this._osTypes.Mac;

            }
        }
        return this._osTypes.Generic;
    },
    /**SNDOC
    @name updateOperatingSystemModelVersion
    @param {GlideRecord} [grOperatingSystemModel] - (mandatory) The Operating System Model Glide Record
	@description Updates the version with a composed version string
    */
    updateOperatingSystemModelVersion: function (grOperatingSystemModel) {
        if (!grOperatingSystemModel) throw new Error('Invalid null argument for the parameter grOperatingSystemModel in the updateOperatingSystemModelVersion operation in the class OperatingSystemUtil');

        var version = this.composeVersion(
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
            case this._osTypes.Windows:
                displayName = this.composeWindowsDisplayNameInternal(
                    grOperatingSystemModel.manufacturer.name.getValue(),
                    grOperatingSystemModel.getValue('name'),
                    grOperatingSystemModel.getValue('edition'),
                    grOperatingSystemModel.getValue('version'),
                    grOperatingSystemModel.getValue('u_version_alias'),
                    grOperatingSystemModel.getValue('u_product_lifecycle_management_policy'));

                if (displayName) grOperatingSystemModel.setValue('display_name', displayName);
                break;

            default:
                displayName = this.composeGenericDisplayNameInternal(
                    grOperatingSystemModel.manufacturer.name.getValue(),
                    grOperatingSystemModel.getValue('name'),
                    grOperatingSystemModel.getValue('edition'),
                    grOperatingSystemModel.getValue('version'));

                if (displayName) grOperatingSystemModel.setValue('display_name', displayName);
                break;
        }
    },
    /**SNDOC
    @name updateOperatingSystemModelDisplayName
    @param {GlideRecord} [grOperatingSystemModel] - (mandatory) The Operating System Model Glide Record
	@description Updates the display name for some operating system
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
            grOperatingSystemCI.setValue('key', grOperatingSystemCI.u_cmdb_ci + '::' + grOperatingSystemCI.model_id.name.getValue() + '::' + grOperatingSystemCI.model_id.version.getValue() + '::1');
        }
    },
    /**SNDOC
    @name isServerEdition
	@description verifies the name and check if it is related to server operating system
    @return {boolean} the boolean indicating if the name represents a server operating system
    */
    isServerEdition: function (name) {
        var serverPattern = /server/i;
        var match = serverPattern.exec(name);
        if (match) {
            return true;
        }
        return false;
    },
    /**SNDOC
    @name getVendorCompany
	@description Gets the vendor company
    @param {string} [name] the name of the vendor company
    @return {GlideRecord} the record of the vendor company
    */
    getVendorCompany: function (name) {
        if (!name) throw new Error('Invalid null argument for the parameter name in the getVendorCompany operation in the class OperatingSystemUtil');

        var grCompany = new GlideRecord('core_company');
        grCompany.addQuery('name', 'STARTSWITH', name);
        grCompany.addQuery('manufacturer', true).addOrCondition('vendor', true);
        grCompany.orderBy('sys_created_on');
        grCompany.setLimit(1);
        grCompany.query();
        if (grCompany.next()) return grCompany;

        grCompany = new GlideRecord('core_company');
        grCompany.addQuery('name', 'LIKE', name);
        grCompany.addQuery('manufacturer', true).addOrCondition('vendor', true);
        grCompany.orderBy('sys_created_on');
        grCompany.setLimit(1);
        grCompany.query();
        if (grCompany.next()) return grCompany;

        return null;
    },
    /**SNDOC
    @name getAppleVendorCompany
	@description Gets the Apple vendor company
    @return {GlideRecord} the record of the Apple vendor company
    */
    getAppleVendorCompany: function () {
        return this.getVendorCompany(this._appleVendorName);
    },
    /**SNDOC
     @name getMicrosoftVendorCompany
     @description Gets the Microsoft vendor company
     @return {GlideRecord} the record of the Microsoft vendor company
     */
    getMicrosoftVendorCompany: function () {
        return this.getVendorCompany(this._appleVendorName);
    },
    /**SNDOC
     @name getGoogleVendorCompany
     @description Gets the Google vendor company
     @return {GlideRecord} the record of the Google vendor company
     */
    getGoogleVendorCompany: function () {
        return this.getVendorCompany(this._googleVendorName);
    },

    /**SNDOC
    @name extractWindowsProductName
	@description TBD
    @param {string} [name] - (mandatory) the raw name of operating system
    @return {GlideRecord} the windows product name
    */
    extractWindowsProductName: function (name) {
        var server = this.isServerEdition(name);
        if (server) {
            return this._windowsServerDefaultName;
        } else {
            return this._windowsDesktopDefaultName;
        }
    },
    /**SNDOC
    @name extractWindowsEdition
	@description TBD
    @param {string} [name] - (mandatory) the name of the operating system
    @return {GlideRecord} the record of operating system model
    */
    extractWindowsEdition: function (name) {
        if (!name) throw new Error('Invalid null argument for the parameter name in the extractWindowsEdition operation in the class OperatingSystemUtil');

        var server = this.isServerEdition(name);
        var windowsEditionPattern = /(Home|Pro|Professional|Mobile|IoT|Education|Enterprise|Essentials|Standard|Datacenter)/i;
        var matchWindowsEdition = windowsEditionPattern.exec(name);
        if (matchWindowsEdition) {
            return matchWindowsEdition[0];
        } else if (server) {
            return this._defaultWindowsServerEdition;
        } else {
            return this._defaultWindowsDesktopEdition;
        }
    },

    /**SNDOC
    @name extractLifecycleManagementPolicy
	@description Extracts the lifecycle management policy token
    @param {string} [name] - (mandatory) the name of the operating system
    @return {string} The lifecycle management policy token
    */
    extractLifecycleManagementPolicy: function (name) {
        var lifecyclePattern = /(LTS|LTSC|LTSB)/i;
        lifecycleMatch = lifecyclePattern.exec(name);
        if (lifecycleMatch) {
            return lifecycleMatch[0];
        }
        return '';
    },
    /**SNDOC
    @name extractLinuxVendorName
	@description Extracts the vendor name
    @param {string} [name] - (mandatory) the name of the operating system
    @return {string} the linux vendor name
    */
    extractLinuxVendorName: function (name) {
        if (!name) throw new Error('Invalid null argument for the parameter name in the extractLinuxVendorName operation in the class OperatingSystemUtil');

        var linuxVendorNamePattern = /(CANONICAL UBUNTU|CANONICAL|UBUNTU|ORACLE|AMAZON|CENTOS|REDHAT|SUSE|DEBIAN|FEDORA)/i;
        var matchVendor = linuxVendorNamePattern.exec(name);
        if (matchVendor) {
            nameToSearch = this.toProperCase(matchVendor[0]);
            if (nameToSearch.includes(this._canonicalVendorName) || nameToSearch.includes(this._ubuntuLinuxOSName)) {
                return this._canonicalVendorName;
            } else {
                return nameToSearch;
            }
        }
    },
    /**SNDOC
    @name extractLinuxProductName
	@description Extracts the Linux Edition
    @param {string} [name] - (mandatory) the name of the operating system
    @param {string} [vendorName] - (optional) the name of the operating system
    @return {string} the linux product name
    */
    extractLinuxProductName: function (name, vendorName) {
        if (!name) throw new Error('Invalid null argument for the parameter name in the extractLinuxProductName operation in the class OperatingSystemUtil');

        switch (vendorName) {
            case this._canonicalVendorName:
                return this._ubuntuLinuxOSName;
            default:
                return this._linuxDefaultName;
        }
    },
    /**SNDOC
    @name extractLinuxEditionName
	@description Extracts the Linux Edition
    @param {string} [name] - (mandatory) the name of the operating system
    @param {string} [vendorName] - (mandatory) the name of the operating system
    @return {string} the linux edition
    */
    extractLinuxEditionName: function (name, vendorName) {
        var server = this.isServerEdition(name);
        switch (vendorName) {
            case this._canonicalVendorName:
                return server ? 'Server' : 'Desktop';
            default:
                return null;
        }
    },
    /**SNDOC
    @name extractUnixVendorName
	@description Extracts the vendor name
    @param {string} [name] - (mandatory) the name of the operating system
    @return {string} the Unix vendor name
    */
    extractUnixVendorName: function (name) {
        var vendorNamePattern = /(AIX|IBM|Solaris|Sun|Oracle|HPUX|HP)/i;
        var matchVendor = vendorNamePattern.exec(name);
        if (matchVendor) {
            nameToSearch = matchVendor[0];
            if ((nameToSearch.toLowerCase() === 'aix') ||
                (nameToSearch.toLowerCase() === 'ibm')) {
                return this._ibmVendorName;
            } else if ((nameToSearch.toLowerCase() === 'solaris') ||
                (nameToSearch.toLowerCase() === 'sun') ||
                (nameToSearch.toLowerCase() === 'oracle')) {
                return this._oracleVendorName;
            } else if ((nameToSearch.toLowerCase() === 'hpux') ||
                (nameToSearch.toLowerCase() === 'hp')) {
                return this._hpVendorName;
            }
        }
    },
    /**SNDOC
    @name extractUnixProductName
	@description Extracts the Unix product name
    @param {string} [name] - (mandatory) the name of the operating system
    @param {string} [vendorName] - (mandatory) the vendor name of the operating system
    @return {string} the Unix product name
    */
    extractUnixProductName: function (vendorName) {
        switch (vendorName) {
            case this._ibmVendorName:
                return this._aixDefaultName;
            case this._oracleVendorName:
                return this._solarisDefaultName;
            case this._hpVendorName:
                return this._hpuxDefaultName;
            default:
                return this._unixDefaultName;
        }
    },
    /**SNDOC
    @name createOperatingSystemModel
	@description Gets the Entitled To::Allowed For relationship sys_id
    @param {string} [type] the type of the operating system (Mac, Windows, Linux, Unix, iOS, Androide, Generic)
    @param {string} [name] the name of the operating system
    @param {string} [version] the version of the operating system
    @return {GlideRecord} the record of the operating system
    */
    createOperatingSystemModel: function (type, name, version) {
        if (!type) throw new Error('Invalid null argument for the parameter type in the createOperatingSystemModel operation in the class OperatingSystemUtil');
        if (!name) throw new Error('Invalid null argument for the parameter name in the createOperatingSystemModel operation in the class OperatingSystemUtil');
        if (!version) throw new Error('Invalid null argument for the parameter version in the createOperatingSystemModel operation in the class OperatingSystemUtil');

        var objVersion = this.decomposeVersion(type, name, version);
        switch (type) {
            case this._osTypes.Mac:
                return this.createMacOperatingSystemModel(objVersion);
            case this._osTypes.iOS:
                return this.createiOSOperatingSystemModel(objVersion);
            case this._osTypes.Windows:
                return this.createWindowsOperatingSystemModel(name, objVersion);
            case this._osTypes.Android:
                return this.createAndroidOperatingSystemModel(objVersion);
            case this._osTypes.Linux:
                return this.createLinuxOperatingSystemModel(name, objVersion);
            case this._osTypes.Unix:
                return this.createUnixOperatingSystemModel(name, objVersion);
            case this._osTypes.Generic:
            default:
                throw new Error('Generic or unknow OS type creation is not allowed');
        }
    },
    createOperatingSystemModelInternal: function (type, name, version, major, minor, review, build, edition, vendorSysId, lifecycleManagementPolicy, versionAlias) {
        if (!type) throw new Error('Invalid null argument for the parameter type in the createOperatingSystemModelInternal operation in the class OperatingSystemUtil');
        if (!name) throw new Error('Invalid null argument for the parameter name in the createOperatingSystemModelInternal operation in the class OperatingSystemUtil');
        if (!version) throw new Error('Invalid null argument for the parameter version in the createOperatingSystemModelInternal operation in the class OperatingSystemUtil');
        if (!major) throw new Error('Invalid null argument for the parameter major in the createOperatingSystemModelInternal operation in the class OperatingSystemUtil');

        var grOSModel = new GlideRecord('u_cmdb_operating_system_product_model');
        grOSModel.initialize();
        grOSModel.setValue('type', type);
        grOSModel.setValue('name', name);
        grOSModel.setValue('version', version);
        grOSModel.setValue('major_version', major);
        if (minor) grOSModel.setValue('minor_version', minor);
        if (review) grOSModel.setValue('review_version', review);
        if (build) grOSModel.setValue('build_version', build);
        if (edition) grOSModel.setValue('edition', edition);
        if (vendorSysId) grOSModel.setValue('manufacturer', vendorSysId);
        if (lifecycleManagementPolicy) grOSModel.setValue('u_product_lifecycle_management_policy', lifecycleManagementPolicy);
        if (versionAlias) grOSModel.setValue('u_version_alias', versionAlias);

        sysID = grOSModel.insert();
        if (sysID) return grOSModel;
    },
    /**SNDOC
    @name createMacOperatingSystemModel
	@description TBD
    @param {object} [objVersion] - (mandatory) the object representing the decomposed version
    @return {GlideRecord} the record of operating system model
    */
    createMacOperatingSystemModel: function (objVersion) {
        if (!objVersion) throw new Error('Invalid null argument for the parameter objVersion in the createMacOperatingSystemModel operation in the class OperatingSystemUtil');
        var grVendor = this.getAppleVendorCompany();
        var vendorSysId = grVendor ? grVendor.getUniqueValue() : null;
        return this.createOperatingSystemModelInternal(
            this._osTypes.Mac,
            this._macOSDefaultName,
            objVersion.version,
            objVersion.major,
            objVersion.minor,
            objVersion.review,
            objVersion.build,
            null,
            vendorSysId,
            null,
            null);
    },
    /**SNDOC
    @name createiOSOperatingSystemModel
	@description TBD
    @param {object} [objVersion] - (mandatory) the object representing the decomposed version
    @return {GlideRecord} the record of operating system model
    */
    createiOSOperatingSystemModel: function (objVersion) {
        if (!objVersion) throw new Error('Invalid null argument for the parameter objVersion in the createiOSOperatingSystemModel operation in the class OperatingSystemUtil');
        var grVendor = this.getAppleVendorCompany();
        var vendorSysId = grVendor ? grVendor.getUniqueValue() : null;
        return this.createOperatingSystemModelInternal(
            this._osTypes.iOS,
            this._iOSDefaultName,
            objVersion.version,
            objVersion.major,
            objVersion.minor,
            objVersion.review,
            objVersion.build,
            null,
            vendorSysId,
            null,
            null);
    },
    /**SNDOC
    @name composeGenericDisplayNameInternal
	@description TBD
    @param {string} [vendorName] the name of the operating system
    @param {string} [name] the name of the operating system
    @param {string} [version] the name of the operating system
    @return {string} the composed generic display name
    */
    composeGenericDisplayNameInternal: function (vendorName, name, edition, version, lifecycleManagementPolicy) {
        var displayName = name;

        if (vendorName) {
            displayName = vendorName + ' ' + displayName;
        }

        if (version) {
            displayName += ' ' + version;
        }

        if (lifecycleManagementPolicy) {
            displayName += ' ' + lifecycleManagementPolicy;
        }

        if (edition) {
            displayName += ' ' + edition;
        }

        return displayName;
    },
    /**SNDOC
    @name composeWindowsProductNameInternal
	@description TBD
    @param {string} [vendorName] the name of the operating system
    @param {string} [name] the name of the operating system
    @param {string} [edition] the name of the operating system
    @param {string} [version] the name of the operating system
    @param {string} [versionAlias] the name of the operating system
    @return {string} the composed windows display name
    */
    composeWindowsDisplayNameInternal: function (vendorName, name, edition, version, versionAlias, lifecycleManagementPolicy) {
        var displayName = name;

        if (vendorName) {
            displayName = vendorName + ' ' + displayName;
        }

        if (lifecycleManagementPolicy) {
            displayName += ' ' + lifecycleManagementPolicy;
        }

        if (edition) {
            displayName += ' ' + edition;
        }


        if (versionAlias) {
            displayName += ' ' + versionAlias;
        } else if (version) {
            displayName += ' ' + version;
        }

        return displayName;
    },
    /**SNDOC
    @name createWindowsOperatingSystemModel
	@description TBD
    @param {string} [name] the name of the operating system
    @param {object} [objVersion] - (mandatory) the object representing the decomposed version
    @return {GlideRecord} the record of operating system model
    */
    createWindowsOperatingSystemModel: function (name, objVersion) {
        if (!name) throw new Error('Invalid null argument for the parameter name in the createLinuxOperatingSystemModel operation in the class OperatingSystemUtil');
        if (!objVersion) throw new Error('Invalid null argument for the parameter objVersion in the createWindowsOperatingSystemModel operation in the class OperatingSystemUtil');
        var grVendor = this.getMicrosoftVendorCompany();
        var vendorSysId = grVendor ? grVendor.getUniqueValue() : null;
        var productName = this.extractWindowsProductName(name);
        var edition = this.extractWindowsEdition(name);
        return this.createOperatingSystemModelInternal(
            this._osTypes.Windows,
            productName,
            objVersion.version,
            objVersion.major,
            objVersion.minor,
            null,
            objVersion.build,
            edition,
            vendorSysId,
            objVersion.lifecycleManagementPolicy,
            objVersion.versionAlias);
    },
    /**SNDOC
    @name createLinuxOperatingSystemModel
	@description TBD
    @param {string} [name] the name of the operating system
    @param {object} [objVersion] - (mandatory) the object representing the decomposed version
    @return {GlideRecord} the record of operating system model
    */
    createLinuxOperatingSystemModel: function (name, objVersion) {
        if (!name) throw new Error('Invalid null argument for the parameter name in the createLinuxOperatingSystemModel operation in the class OperatingSystemUtil');
        if (!objVersion) throw new Error('Invalid null argument for the parameter objVersion in the createLinuxOperatingSystemModel operation in the class OperatingSystemUtil');

        var vendorSysId = null;
        var vendorName = this.extractLinuxVendorName(name);
        if (vendorName) {
            var grVendor = this.getVendorCompany(vendorName);
            if (grVendor) {
                vendorSysId = grVendor.getUniqueValue();
            }
        }
        var productName = this.extractLinuxProductName(name, vendorName);
        var edition = this.extractLinuxEditionName(name, vendorName);
        return this.createOperatingSystemModelInternal(
            this._osTypes.Linux,
            productName,
            objVersion.version,
            objVersion.major,
            objVersion.minor,
            objVersion.review,
            objVersion.build,
            edition,
            vendorSysId,
            objVersion.lifecycleManagementPolicy,
            null);
    },
    /**SNDOC
    @name createUnixOperatingSystemModel
	@description TBD
    @param {string} [name] the name of the operating system
    @param {object} [objVersion] - (mandatory) the object representing the decomposed version
    @return {GlideRecord} the record of operating system model
    */
    createUnixOperatingSystemModel: function (name, objVersion) {
        if (!name) throw new Error('Invalid null argument for the parameter name in the createUnixOperatingSystemModel operation in the class OperatingSystemUtil');
        if (!objVersion) throw new Error('Invalid null argument for the parameter objVersion in the createUnixOperatingSystemModel operation in the class OperatingSystemUtil');

        var vendorSysId = null;
        var vendorName = this.extractUnixVendorName(name);
        if (vendorName) {
            var grVendor = this.getVendorCompany(vendorName);
            if (grVendor) {
                vendorSysId = grVendor.getUniqueValue();
            }
        }
        var productName = this.extractUnixProductName(vendorName);
        return this.createOperatingSystemModelInternal(
            this._osTypes.Unix,
            productName,
            objVersion.version,
            objVersion.major,
            objVersion.minor,
            objVersion.review,
            objVersion.build,
            null,
            vendorSysId,
            null,
            null);
    },
    /**SNDOC
    @name createAndroidOperatingSystemModel
	@description TBD
    @param {object} [objVersion] - (mandatory) the object representing the decomposed version
    @return {GlideRecord} the record of operating system model
    */
    createAndroidOperatingSystemModel: function (objVersion) {
        if (!objVersion) throw new Error('Invalid null argument for the parameter objVersion in the createAndroidOperatingSystemModel operation in the class OperatingSystemUtil');

        var vendorSysId = null;
        var grVendor = this.getGoogleVendorCompany();
        if (grVendor) vendorSysId = grVendor.getUniqueValue();
        var productName = this._androidDefaultName;
        return this.createOperatingSystemModelInternal(
            this._osTypes.Android,
            productName,
            objVersion.version,
            objVersion.major,
            objVersion.minor,
            objVersion.review,
            null,
            null,
            vendorSysId,
            null,
            null);
    },
    /**SNDOC
    @name getOperatingSystemModel
	@description Gets the Entitled To::Allowed For relationship sys_id
    @param {string} [type] - (mandatory) the type of the operating system (Mac, Windows, Linux, Unix, iOS, Androide, Generic)
    @param {string} [name] - (mandatory) the name of the operating system
    @param {string} [version] - (mandatory) the version of the operating system
    @return {string} The Entitled To::Allowed For relationship sys_id
    */
    getOperatingSystemModel: function (type, name, version) {
        if (!type) throw new Error('Invalid null argument for the parameter type in the getOperatingSystemModel operation in the class OperatingSystemUtil');
        if (!name) throw new Error('Invalid null argument for the parameter name in the getOperatingSystemModel operation in the class OperatingSystemUtil');
        if (!version) throw new Error('Invalid null argument for the parameter version in the getOperatingSystemModel operation in the class OperatingSystemUtil');

        var objVersion = this.decomposeVersion(type, name, version);
        if (objVersion) {
            switch (type) {
                case this._osTypes.Mac:
                    return this.getMacOperatingSystemModel(objVersion);
                case this._osTypes.iOS:
                    return this.getiOSOperatingSystemModel(objVersion);
                case this._osTypes.Android:
                    return this.getAndroidOperatingSystemModel(objVersion);
                case this._osTypes.Windows:
                    return this.getWindowsOperatingSystemModel(name, objVersion);
                case this._osTypes.Linux:
                    return this.getLinuxOperatingSystemModel(name, objVersion);
                case this._osTypes.Unix:
                    return this.getUnixOperatingSystemModel(name, objVersion);
                case this._osTypes.Generic:
                    return this.getGenericOperatingSystemModel(name, objVersion);
                default:
                    return null;
            }
        }

        return null;
    },
    /**SNDOC
    @name getOperatingSystemModelInternal
	@description TBD
    @param {string} [type] the type of the operating system (Mac, Windows, Linux, Unix, iOS, Androide, Generic)
    @param {string} [major] the version major element of the operating system
    @param {string} [minor] the version minor element of the operating system
    @param {string} [review] the version review element of the operating system
    @param {string} [build] the version build element of the operating system
    @param {string} [name] the name of the operating system
    @param {string} [edition] the edition of the operating system
    @return {GlideRecord} the record of operating system model
    */
    getOperatingSystemModelInternal: function (type, major, minor, review, build, name, edition, vendorSysId) {
        if (!type) throw new Error('Invalid null argument for the parameter type in the getOperatingSystemModelInternal operation in the class OperatingSystemUtil');
        grOSModel = new GlideRecord('u_cmdb_operating_system_product_model');
        grOSModel.setLimit(1);
        grOSModel.addQuery('u_type', type);
        if (major) grOSModel.addQuery('major_version', major);
        if (minor) grOSModel.addQuery('minor_version', minor);
        if (review) grOSModel.addQuery('review_version', review);
        if (build) grOSModel.addQuery('build_version', build);
        if (name) grOSModel.addQuery('name', 'CONTAINS', name);
        if (edition) grOSModel.addQuery('edition', 'CONTAINS', edition);
        if (vendorSysId) grOSModel.addQuery('manufacturer', vendorSysId);
        grOSModel.orderBy('major_version');
        grOSModel.orderBy('minor_version');
        grOSModel.orderBy('review_version');
        grOSModel.orderBy('build_version');
        grOSModel.query();
        if (grOSModel.next()) {
            return grOSModel;
        }
    },
    /**SNDOC
    @name getMacOperatingSystemModel
	@description TBD
    @param {object} [objVersion] - (mandatory) the object representing the decomposed version
    @return {GlideRecord} the record of operating system model
    */
    getMacOperatingSystemModel: function (objVersion) {
        if (!objVersion) throw new Error('Invalid null argument for the parameter objVersion in the getMacOperatingSystemModel operation in the class OperatingSystemUtil');
        if (!objVersion.major) throw new Error('Invalid null argument for the parameter objVersion.major in the getMacOperatingSystemModel operation in the class OperatingSystemUtil');

        var grOSModel = this.getOperatingSystemModelInternal(this._osTypes.Mac, objVersion.major, objVersion.minor, objVersion.review, objVersion.build, null, null);
        if (grOSModel) return grOSModel;

        return null;
    },
    /**SNDOC
    @name getiOSOperatingSystemModel
	@description TBD
    @param {object} [objVersion] - (mandatory) the object representing the decomposed version
    @return {GlideRecord} the record of operating system model
    */
    getiOSOperatingSystemModel: function (objVersion) {
        if (!objVersion) throw new Error('Invalid null argument for the parameter objVersion in the getiOSOperatingSystemModel operation in the class OperatingSystemUtil');
        if (!objVersion.major) throw new Error('Invalid null argument for the parameter objVersion.major in the getiOSOperatingSystemModel operation in the class OperatingSystemUtil');

        var grOSModel = this.getOperatingSystemModelInternal(this._osTypes.iOS, objVersion.major, objVersion.minor, objVersion.review, objVersion.build, null, null);
        if (grOSModel) return grOSModel;

        return null;
    },
    /**SNDOC
    @name getWindowsOperatingSystemModel
	@description TBD
    @param {string} [name] - (mandatory) the name of the operating system
    @param {object} [objVersion] - (mandatory) the object representing the decomposed version
    @return {GlideRecord} the record of operating system model
    */
    getWindowsOperatingSystemModel: function (name, objVersion) {
        if (!name) throw new Error('Invalid null argument for the parameter name in the getWindowsOperatingSystemModel operation in the class OperatingSystemUtil');
        if (!objVersion) throw new Error('Invalid null argument for the parameter objVersion in the getWindowsOperatingSystemModel operation in the class OperatingSystemUtil');

        var productName = this.extractWindowsProductName(name);
        var edition = this.extractWindowsEdition(name);

        var grOSModel = this.getOperatingSystemModelInternal(this._osTypes.Windows, objVersion.major, objVersion.minor, null, objVersion.build, productName, edition);
        if (grOSModel) return grOSModel;

        return null;
    },
    /**SNDOC
    @name getLinuxOperatingSystemModel
	@description TBD
    @param {string} [name] - (mandatory) the name of the operating system
    @param {object} [objVersion] - (mandatory) the object representing the decomposed version
    @return {GlideRecord} the record of operating system model
    */
    getLinuxOperatingSystemModel: function (name, objVersion) {
        if (!name) throw new Error('Invalid null argument for the parameter name in the getLinuxOperatingSystemModel operation in the class OperatingSystemUtil');
        if (!objVersion) throw new Error('Invalid null argument for the parameter objVersion in the getLinuxOperatingSystemModel operation in the class OperatingSystemUtil');

        var vendorSysId = null;
        var vendorName = this.extractLinuxVendorName(name);
        if (vendorName) {
            var grVendor = this.getVendorCompany(vendorName);
            if (grVendor) {
                vendorSysId = grVendor.getUniqueValue();
            }
        }
        var productName = this.extractLinuxProductName(name, vendorName);
        var edition = this.extractLinuxEditionName(name, vendorName);

        var grOSModel = this.getOperatingSystemModelInternal(this._osTypes.Linux, objVersion.major, objVersion.minor, objVersion.review, objVersion.build, productName, edition, vendorSysId);
        if (grOSModel) return grOSModel;

        return null;
    },
    /**SNDOC
    @name getUnixOperatingSystemModel
	@description TBD
    @param {string} [name] - (mandatory) the name of the operating system
    @param {object} [objVersion] - (mandatory) the object representing the decomposed version
    @return {GlideRecord} the record of operating system model
    */
    getUnixOperatingSystemModel: function (name, objVersion) {
        if (!name) throw new Error('Invalid null argument for the parameter name in the getUnixOperatingSystemModel operation in the class OperatingSystemUtil');
        if (!objVersion) throw new Error('Invalid null argument for the parameter objVersion in the getUnixOperatingSystemModel operation in the class OperatingSystemUtil');

        var vendorSysId = null;
        var vendorName = this.extractUnixVendorName(name);
        if (vendorName) {
            var grVendor = this.getVendorCompany(vendorName);
            if (grVendor) {
                vendorSysId = grVendor.getUniqueValue();
            }
        }
        var productName = this.extractUnixProductName(vendorName);
        var grOSModel = this.getOperatingSystemModelInternal(this._osTypes.Unix, objVersion.major, objVersion.minor, objVersion.review, objVersion.build, productName, null, vendorSysId);
        if (grOSModel) return grOSModel;

        return null;
    },
    /**SNDOC
    @name getAndroidOperatingSystemModel
	@description TBD
    @param {object} [objVersion] - (mandatory) the object representing the decomposed version
    @return {GlideRecord} the record of operating system model
    */
    getAndroidOperatingSystemModel: function (objVersion) {
        if (!objVersion) throw new Error('Invalid null argument for the parameter objVersion in the getAndroidOperatingSystemModel operation in the class OperatingSystemUtil');

        var grOSModel = this.getOperatingSystemModelInternal(this._osTypes.Android, objVersion.major, objVersion.minor, objVersion.review, objVersion.build, null, null);
        if (grOSModel) return grOSModel;

        return null;
    },
    /**SNDOC
    @name getGenericOperatingSystemModel
	@description TBD
    @param {string} [name] - (mandatory) the name of the operating system
    @param {object} [objVersion] - (mandatory) the object representing the decomposed version
    @return {GlideRecord} the record of operating system model
    */
    getGenericOperatingSystemModel: function (name, objVersion) {
        if (!name) throw new Error('Invalid null argument for the parameter name in the getGenericOperatingSystemModel operation in the class OperatingSystemUtil');
        if (!objVersion) throw new Error('Invalid null argument for the parameter objVersion in the getGenericOperatingSystemModel operation in the class OperatingSystemUtil');

        var grOSModel = this.getOperatingSystemModelInternal(this._osTypes.Generic, objVersion.major, objVersion.minor, objVersion.review, objVersion.build, name, null);
        if (grOSModel) return grOSModel;

        return null;
    },
    /**SNDOC
    @name getOrCreateOperatingSystemModel
	@description TBD
    @param {string} [name] - (mandatory) the name of the operating system
    @param {string} [version] - (mandatory) the version of the operating system
    @param {string} [type] - the type of the operating system (Mac, Windows, Linux, Unix, iOS, Androide, Generic)
    @return {string} sys_id of the vendor concatenated with the sys_id of operating system model
    */
    getOrCreateOperatingSystemModel: function (name, version, type) {
        if (!name) throw new Error('Invalid null argument for the parameter name in the getOrCreateOperatingSystemModel operation in the class OperatingSystemUtil');
        if (!version) throw new Error('Invalid null argument for the parameter version in the getOrCreateOperatingSystemModel operation in the class OperatingSystemUtil');

        if (!type) {
            type = this.cleanseOperatingSystemType(name);
        }

        var sysID = '';

        var grOSModel = this.getOperatingSystemModel(type, name, version);

        if (!grOSModel) grOSModel = this.createOperatingSystemModel(type, name, version);

        if (grOSModel) return grOSModel.getUniqueValue();

        return sysID + '';
    },
    /**SNDOC
    @name decomposeVersion
	@description TBD
    @param {string} [type] - (mandatory) the type of the operating system (Mac, Windows, Linux, Unix, iOS, Androide, Generic)
    @param {string} [name] - (mandatory) the name of the operating system
    @param {string} [version] - (mandatory) the version of the operating system
    @return {object} Object with decomposed version in the field version, major, minor, review and build, betaRC, betaRCNumber
    */
    composeVersion: function (type, major, minor, review, build, lifecycleManagementPolicy, betaRC, betaRCNumber) {
        if (!type) throw new Error('Invalid null argument for the parameter type in the composeVersion operation in the class OperatingSystemUtil');
        switch (type) {
            case this._osTypes.Mac:
            case this._osTypes.iOS:
                return this.composeAppleVersionInternal(major, minor, review, build, betaRC, betaRCNumber);

            case this._osTypes.Windows:
                return this.composeMicrosoftVersionInternal(major, minor, build);

            case this._osTypes.Linux:
                return this.composeLinuxVersionInternal(major, minor, review, build, lifecycleManagementPolicy);

            case this._osTypes.Android:
                return this.composeAndroidVersionInternal(major, minor, review);

            case this._osTypes.Unix:
            case this._osTypes.Generic:
                return this.composeGenericVersionInternal(major, minor, review, build);

            default:
                return '';
        }
    },
    /**SNDOC
    @name decomposeVersion
	@description TBD
    @param {string} [type] - (mandatory) the type of the operating system (Mac, Windows, Linux, Unix, iOS, Androide, Generic)
    @param {string} [name] - (mandatory) the name of the operating system
    @param {string} [version] - (mandatory) the version of the operating system
    @return {object} Object with decomposed version in the field version, major, minor, review and build, betaRC, betaRCNumber
    */
    decomposeVersion: function (type, name, version) {
        if (!type) throw new Error('Invalid null argument for the parameter type in the decomposeVersion operation in the class OperatingSystemUtil');
        if (!name) throw new Error('Invalid null argument for the parameter name in the decomposeVersion operation in the class OperatingSystemUtil');
        if (!version) throw new Error('Invalid null argument for the parameter version in the decomposeVersion operation in the class OperatingSystemUtil');

        switch (type) {
            case this._osTypes.Mac:
                return this.decomposeMacVersion(version);
            case this._osTypes.Windows:
                return this.decomposeWindowsVersion(name, version);
            case this._osTypes.Linux:
                return this.decomposeLinuxVersion(name, version);
            case this._osTypes.Unix:
                return this.decomposeUnixVersion(name, version);
            case this._osTypes.iOS:
                return this.decomposeIOSVersion(version);
            case this._osTypes.Android:
                return this.decomposeAndroidVersion(version);
            default:
                return this.decomposeGenericVersion(version);
        }
    },
    /**SNDOC
    @name decomposeMacVersion
	@description TBD
    @param {string} [version] - (mandatory) the version of the operating system
    @return {object} Object with decomposed version in the field version, major, minor, review and build, betaRC, betaRCNumber
    */
    decomposeMacVersion: function (version) {
        if (!version) throw new Error('Invalid null argument for the parameter version in the decomposeMacVersion operation in the class OperatingSystemUtil');

        var objVersion = this.decomposeAppleVersionInternal(version);
        if (objVersion) {
            objVersion.type = this._osTypes.Mac;
        }
        return objVersion;
    },
    /**SNDOC
    @name decomposeIOSVersion
	@description TBD
    @param {string} [version] - (mandatory) the version of the operating system
    @return {object} Object with decomposed version in the field version, major, minor, review and build, betaRC, betaRCNumber
    */
    decomposeIOSVersion: function (version) {
        if (!version) throw new Error('Invalid null argument for the parameter version in the decomposeIOSVersion operation in the class OperatingSystemUtil');

        var objVersion = this.decomposeAppleVersionInternal(version);
        if (objVersion) {
            objVersion.type = this._osTypes.Mac;
        }
        return objVersion;
    },
    /**SNDOC
    @name composeAppleVersionInternal
	@description TBD
    @param {string} [version] - (mandatory) the version of the operating system
    @return {object} Object with decomposed version in the field version, major, minor, review and build, betaRC, betaRCNumber
    */
    composeAppleVersionInternal: function (major, minor, review, build, betaRC, betaRCNumber) {
        if (!major) return '';
        if (!minor) return '';
        return major + '.' + minor + (review !== '0' ? '.' + review : '') + (betaRC ? ' ' + betaRC + (betaRCNumber ? ' ' + betaRCNumber : '') : '') + (build ? ' (' + build + ')' : '');
    },
    /**SNDOC
    @name decomposeAppleVersionInternal
	@description TBD
    @param {string} [version] - (mandatory) the version of the operating system
    @return {object} Object with decomposed version in the field version, major, minor, review and build, betaRC, betaRCNumber
    */
    decomposeAppleVersionInternal: function (version) {
        if (!version) throw new Error('Invalid null argument for the parameter version in the decomposeAppleVersionInternal operation in the class OperatingSystemUtil');
        var versionPattern = /(\d{1,5})(?:\.(\d{1,5})(?:\.(\d{1,5}))?)?(?:\s+(RC|Beta)(?:\s+(\d+))?)?(?:\s*\(?(\d\w{1,8})\)?)?(?:\s+(RC|Beta)(?:\s+(\d+))?)?/i;
        var match = versionPattern.exec(version);
        if (match) {
            var major = match[1];
            var minor = match[2] || '0';
            var review = match[3] || '0';
            var betaRC = match[4] || match[7] || '';
            var betaRCNumber = match[5] || match[8] || '';
            var build = match[6] || '';
            return {
                version: this.composeAppleVersionInternal(major, minor, review, build, betaRC, betaRCNumber) || version,
                major: major,
                minor: minor,
                review: review,
                build: build,
                betaRC: betaRC ? betaRC + (betaRCNumber ? ' ' + betaRCNumber : '') : ''
            };
        } else {
            return null;
        }
    },
    /**SNDOC
    @name decomposeWindowsVersion
	@description TBD
    @param {string} [name] - (mandatory) the name of the operating system
    @param {string} [version] - (mandatory) the version of the operating system
    @return {object} Object with decomposed version in the field version, major, minor, review and build, betaRC, betaRCNumber
    */
    decomposeWindowsVersion: function (name, version) {
        if (!name) throw new Error('Invalid null argument for the parameter name in the decomposeWindowsVersion operation in the class OperatingSystemUtil');
        if (!version) throw new Error('Invalid null argument for the parameter version in the decomposeWindowsVersion operation in the class OperatingSystemUtil');

        var server = this.isServerEdition(name);
        if (server) {
            return this.decomposeWindowsServerVersion(name, version);
        } else {
            return this.decomposeWindowsDesktopVersion(name, version);
        }
    },
    /**SNDOC
    @name decomposeWindowsServerVersion
	@description TBD
    @param {string} [name] - (mandatory) the name of the operating system
    @param {string} [version] - (mandatory) the version of the operating system
    @return {object} Object with decomposed version in the field version, major, minor, review and build, betaRC, betaRCNumber
    */
    decomposeWindowsServerVersion: function (name, version) {
        if (!name) throw new Error('Invalid null argument for the parameter name in the decomposeWindowsServerVersion operation in the class OperatingSystemUtil');
        if (!version) throw new Error('Invalid null argument for the parameter version in the decomposeWindowsServerVersion operation in the class OperatingSystemUtil');

        var objversion = this.decomposeMicrosoftVersionInternal(version);
        if (objversion) {
            objversion.type = this._osTypes.Windows;
            objversion.lifecycleManagementPolicy =
                this.extractLifecycleManagementPolicy(name) ||
                this.extractLifecycleManagementPolicy(version);
        }
        return objversion;
    },
    /**SNDOC
    @name decomposeWindowsDesktopVersion
	@description TBD
    @param {string} [name] - (mandatory) the name of the operating system
    @param {string} [version] - (mandatory) the version of the operating system
    @return {object} Object with decomposed version in the field version, major, minor, review and build, betaRC, betaRCNumber
    */
    decomposeWindowsDesktopVersion: function (name, version) {
        if (!name) throw new Error('Invalid null argument for the parameter name in the decomposeWindowsDesktopVersion operation in the class OperatingSystemUtil');
        if (!version) throw new Error('Invalid null argument for the parameter version in the decomposeWindowsDesktopVersion operation in the class OperatingSystemUtil');

        var objversion = this.decomposeMicrosoftVersionInternal(version);
        if (objversion) {
            objversion.type = this._osTypes.Windows;
        }
        return objversion;
    },
    /**SNDOC
    @name omposeMicrosoftVersionInternal
	@description TBD
    @param {string} [version] - (mandatory) the version of the operating system
    @return {object} Object with decomposed version in the field version, major, minor, review and build, betaRC, betaRCNumber
    */
    composeMicrosoftVersionInternal: function (major, minor, build) {
        if (!major) return '';
        if (!minor) return '';
        if (!build) return '';
        return major + '.' + minor + '.' + build;
    },
    /**SNDOC
    @name decomposeMicrosoftVersionInternal
	@description TBD
    @param {string} [version] - (mandatory) the version of the operating system
    @return {object} Object with decomposed version in the field version, major, minor, review and build, betaRC, betaRCNumber
    */
    decomposeMicrosoftVersionInternal: function (version) {
        if (!version) throw new Error('Invalid null argument for the parameter version in the decomposeMicrosoftVersionInternal operation in the class OperatingSystemUtil');

        var versionPattern = /(\d{1,2})(?:\.(\d{1,5})(?:\.(\d{1,5})(?:\.(\d{1,5}))?)?)?(?:\s*\(?(\d\w{1,8})\)?)?/;
        var match = versionPattern.exec(version);
        var major = match[1];
        var minor = match[2] || '0';
        var build = match[3] || '0';
        //var patch = match[4] || '0';
        var versionAlias = match[5] || '';


        return {
            version: this.composeMicrosoftVersionInternal(major, minor, build) || version,
            major: major,
            minor: minor,
            build: build,
            versionAlias: versionAlias
        };
    },
    /**SNDOC
    @name composeLinuxVersionInternal
	@description TBD
    @param {string} [major] - the major version of the Linux version
    @param {string} [minor] - the minor version of the Linux version
    @param {string} [review] - the review version of the Linux version
    @param {string} [build] - the build version of the Linux version
    @param {string} [lifecycleManagementPolicy] - he lifecycle management policy of the Linux version
    @return {string} the formated Linux version
    */
    composeLinuxVersionInternal: function (major, minor, review, build, lifecycleManagementPolicy) {
        return this.composeGenericVersionInternal(major, minor, review, build) + (lifecycleManagementPolicy ? ' ' + lifecycleManagementPolicy : '');
    },
    /**SNDOC
    @name decomposeLinuxVersion
	@description TBD
    @param {string} [name] - (mandatory) the name of the operating system
    @param {string} [version] - (mandatory) the version of the operating system
    @return {object} Object with decomposed version in the field version, major, minor, review and build, betaRC, betaRCNumber
    */
    decomposeLinuxVersion: function (name, version) {
        if (!name) throw new Error('Invalid null argument for the parameter name in the decomposeLinuxVersion operation in the class OperatingSystemUtil');
        if (!version) throw new Error('Invalid null argument for the parameter version in the decomposeLinuxVersion operation in the class OperatingSystemUtil');

        var objVersion = this.decomposeGenericVersion(version);
        var lifecycleManagementPolicy = this.extractLifecycleManagementPolicy(name) ||
            this.extractLifecycleManagementPolicy(version);
        if (objVersion) {
            objVersion.type = this._osTypes.Linux;
            objVersion.version = this.composeLinuxVersionInternal(objVersion.major, objVersion.minor, objVersion.review, objVersion.build, lifecycleManagementPolicy);
            objVersion.lifecycleManagementPolicy = lifecycleManagementPolicy;

        }
        return objVersion;
    },
    /**SNDOC
    @name decomposeUnixVersion
	@description TBD
    @param {string} [name] - (mandatory) the name of the operating system
    @param {string} [version] - (mandatory) the version of the operating system
    @return {object} Object with decomposed version in the field version, major, minor, review and build, betaRC, betaRCNumber
    */
    decomposeUnixVersion: function (name, version) {
        if (!name) throw new Error('Invalid null argument for the parameter name in the decomposeUnixVersion operation in the class OperatingSystemUtil');
        if (!version) throw new Error('Invalid null argument for the parameter version in the decomposeUnixVersion operation in the class OperatingSystemUtil');

        var objVersion = this.decomposeGenericVersion(version);
        if (objVersion) {
            objVersion.type = this._osTypes.Unix;
        }
        return objVersion;
    },
    /**SNDOC
    @name composeAndroidVersionInternal
	@description TBD
    @param {string} [major] - the version of the operating system
    @param {string} [minor] - the version of the operating system
    @param {string} [review] - the version of the operating system
    @return {string} Object with decomposed version in the field version, major, minor, review and build, betaRC, betaRCNumber
    */
    composeAndroidVersionInternal: function (major, minor, review) {
        if (!major) return '';
        return major + (minor && ((minor !== '0') || (review && (review !== '0'))) ? '.' + minor + (review && (review !== '0') ? '.' + review : '') : '');
    },
    /**SNDOC
    @name decomposeAndroidVersion
	@description TBD
    @param {string} [version] - (mandatory) the version of the operating system
    @return {object} Object with decomposed version in the field version, major, minor, review and build, betaRC, betaRCNumber
    */
    decomposeAndroidVersion: function (version) {
        if (!version) throw new Error('Invalid null argument for the parameter version in the decomposeAndroidVersion operation in the class OperatingSystemUtil');

        var versionPattern = /(\d{1,2})(?:\.(\d{1,5})(?:\.(\d{1,5}))?)?/;
        var match = versionPattern.exec(version);

        if (match) {
            var major = match[1];
            var minor = match[2] || '0';
            var review = match[3] || '0';

            return {
                type: this._osTypes.Android,
                version: this.composeAndroidVersionInternal(major, minor, review) || version,
                major: major,
                minor: minor,
                review: review
            };
        } else {
            return null;
        }
    },
    /**SNDOC
    @name composeGenericVersionInternal
	@description TBD
    @param {string} [version] - (mandatory) the version of the operating system
    @return {object} Object with decomposed version in the field version, major, minor, review and build, betaRC, betaRCNumber
    */
    composeGenericVersionInternal: function (major, minor, review, build) {
        if (!major) return '';
        return major + (minor ? '.' + minor + (review ? '.' + review + (build ? '.' + build : '') : '') : '');
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
        var queryParams = {};
        var grOS;
        if (platformID == 0) { // Windows
            queryParams.type = this._osTypes.Windows;
            queryParams.manufacturer = this.getVendorCompany(this._microsoftVendorName);
            queryParams.name = osVersion;
            queryParams.major_version = osVersion.split(' ')[2];
            queryParams.minor_version = '0';
            queryParams.build_version = osBuild;
            return this.getOrCreateOSWithParams(queryParams);
        }
        if (platformID == 1) { // Mac
            queryParams.type = this._osTypes.Mac;
            queryParams.name = this._macOSDefaultName;
            var rx = /([^(]*)\(([^)]*)\)/; // Big Sur (11.0)  / Monterrey(12)
            var versionArr = rx.exec(osVersion);
            queryParams.short_description = versionArr[1].trim();
            var majMin = versionArr[2].split('.');
            queryParams.major_version = majMin[0];
            if (majMin.length > 1) {
                queryParams.minor_version = majMin[1];
            }
            queryParams.build_version = osBuild.toString();
            queryParams.manufacturer = this.getVendorCompany(this._appleVendorName);
            grOS = this.getOrCreateOSWithParams(queryParams);
            if (grOS.sys_created_on == grOS.sys_updated_on) {
                grOS.version = versionArr[2] + ' (' + osBuild.toString() + ')';
                if(majMin.length < 2) {
                    grOS.minor_version = 0;
                }
                grOS.review_version = 0;
                grOS.update();
            }
            return grOS;
        }

        if (platformID == 3) { // Linux
            var distro = ['Amazon', 'Debian', 'Oracle', 'Ubuntu'];
            var distroName = ['Linux', 'Linux', 'Linux', 'Ubuntu'];
            var distroManufacturer = [
                this.getVendorCompany(this._amazonVendorName),
                this.getVendorCompany(this._debianVendorName),
                this.getVendorCompany(this._oracleVendorName),
                this.getVendorCompany(this._canonicalVendorName)
            ];

            var versionStr = osVersion.split(' ');
            var version = versionStr[versionStr.length - 1].split('.');
            var distroIndex = distro.indexOf(versionStr[0]);
            queryParams.type = 'Linux';
            queryParams.name = distroName[distroIndex];
            queryParams.manufacturer = distroManufacturer[distroIndex];
            queryParams.major_version = version[0];
            if (version.length > 1) {
                queryParams.minor_version = version[1];
            }
            if (productType.toString() == 'Server') {
                queryParams.edition = 'Server';
            }
            return this.getOrCreateOSWithParams(queryParams);
        }

    },
    /**SNDOC
    @description query the operating system table according to the parameter object passed and create it if not found
    @param {object} key: value pairs for querying the cmdb_operating_system_product_model table
    @return {object} GlideRecord if found else null
    */
    getOrCreateOSWithParams: function (queryParams) {
        var queryArray = [];
        var grOS = new GlideRecord('u_cmdb_operating_system_product_model');
        var grOSNew = new GlideRecord('u_cmdb_operating_system_product_model');
        grOSNew.initialize();
        for (var field in queryParams) {
            var fieldValue = queryParams[field];
            if (typeof (fieldValue) == 'object') {
                fieldValue = fieldValue.sys_id;
            }
            queryArray.push(field + '=' + fieldValue.toString());
            grOSNew[field] = fieldValue.toString();
        }
        grOS.addEncodedQuery(queryArray.join('^'));
        grOS.query();
        if (grOS.next()) {
            return grOS;
        }
        gs.info("Couldn't find os with params: " + JSON.stringify(queryArray));
        grOSNew.update();
        return grOSNew;
    },
    /**SNDOC
    @name decomposeGenericVersion
	@description TBD
    @param {string} [version] - (mandatory) the version of the operating system
    @return {object} Object with decomposed version in the field version, major, minor, review and build, betaRC, betaRCNumber
    */
    decomposeGenericVersion: function (version) {
        if (!version) throw new Error('Invalid null argument for the parameter version in the decomposeGenericVersion operation in the class OperatingSystemUtil');

        var versionPattern = /(\d{1,5})(?:\.(\d{1,5})(?:\.(\d{1,5})(?:\.(\d{1,5}))?)?)?/;
        var match = versionPattern.exec(version);
        if (match) {
            var major = match[1];
            var minor = match[2] || '0';
            var review = match[3] || '0';
            var build = match[4] || '0';

            return {
                type: this._osTypes.Android,
                version: this.composeGenericVersionInternal(major, minor, review, build),
                major: major,
                minor: minor,
                review: review,
                build: build
            };
        } else {
            return null;
        }
    },
    /**SNDOC
    @name toProperCase
	@description Applies proper case to the string
    @param {string} [str] - (mandatory) the string parameter to be converted to proper case
    @return {string} the string result converted in proper case
    */
    toProperCase: function (str) {
        if (!str) return str;
        return str.replace(/\b[a-z]/g, function (c) {
            return c.toUpperCase();
        });
    },
    type: 'OperatingSystemUtil',
    _runsOnParentField: 'Runs On',
    _runsOnChildField: 'Runs',
    _entitledToParentField: 'Entitled to',
    _entitledToChildField: 'Allowed for',
    _osTypes: {
        Mac: 'Mac',
        Windows: 'Windows',
        Linux: 'Linux',
        Unix: 'Unix',
        iOS: 'iOS',
        Android: 'Android',
        Generic: 'Generic'
    },
    _macOSDefaultName: 'macOS',
    _windowsDesktopDefaultName: 'Windows',
    _windowsServerDefaultName: 'Windows Server',
    _linuxDefaultName: 'Linux',
    _unixDefaultName: 'Unix',
    _iOSDefaultName: 'iOS',
    _androidDefaultName: 'Android',

    _appleVendorName: 'Apple',
    _amazonVendorName: 'Amazon',
    _microsoftVendorName: 'Microsoft',
    _canonicalVendorName: 'Canonical',
    _debianVendorName: 'Debian',
    _oracleVendorName: 'Oracle',
    _redhatVendorName: 'RedHat',
    _suseVendorName: 'SuSE',
    _fedoraVendorName: 'Fedora',

    _ubuntuLinuxOSName: 'Ubuntu',

    _googleVendorName: 'Google',

    _ibmVendorName: 'IBM',
    _hpVendorName: 'HP',

    _aixDefaultName: 'AIX',
    _hpuxDefaultName: 'HPUX',
    _solarisDefaultName: 'Solaris',

    _defaultWindowsServerEdition: 'Standard',
    _defaultWindowsDesktopEdition: 'Enterprise',
};