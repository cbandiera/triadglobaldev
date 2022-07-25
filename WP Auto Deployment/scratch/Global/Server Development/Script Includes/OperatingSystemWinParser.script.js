var OperatingSystemWinParser = Class.create();
OperatingSystemWinParser.prototype = {

    OsType_windows: 'Windows',
    _microsoftVendorName: 'Microsoft',
    _windowsDesktopDefaultName: 'Windows',
    _windowsServerDefaultName: 'Windows Server',
    _defaultWindowsServerEdition: 'Standard',
    _defaultWindowsDesktopEdition: 'Enterprise',

    initialize: function () {
        this.osUtilInternal = new OperatingSystemInternal();
    },
    /**SNDOC
     @name getMicrosoftVendorCompany
     @description Gets the Microsoft vendor company
     @return {GlideRecord} the record of the Microsoft vendor company
     */
    getMicrosoftVendorCompany: function () {
        return this.osUtilInternal.getVendorCompany(this._microsoftVendorName);
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
        return this.osUtilInternal.createOperatingSystemModelInternal(
            this.OsType_windows,
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

        var grOSModel = this.osUtilInternal.getOperatingSystemModelInternal(this.OsType_windows, objVersion.major, objVersion.minor, null, objVersion.build, productName, edition);
        if (grOSModel) return grOSModel;

        return null;
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

        var server = this.osParser.isServerEdition(name);
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
            objversion.type = this.OsType_windows;
            objversion.lifecycleManagementPolicy =
                this.osParser.extractLifecycleManagementPolicy(name) ||
                this.osParser.extractLifecycleManagementPolicy(version);
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
            objversion.type = this.OsType_windows;
        }
        return objversion;
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
    @name extractWindowsProductName
	@description TBD
    @param {string} [name] - (mandatory) the raw name of operating system
    @return {GlideRecord} the windows product name
    */
    extractWindowsProductName: function (name) {
        var server = this.osParser.isServerEdition(name);
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

        var server = this.osParser.isServerEdition(name);
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
    @name composeMicrosoftVersionInternal
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

    type: 'OperatingSystemWinParser',
};