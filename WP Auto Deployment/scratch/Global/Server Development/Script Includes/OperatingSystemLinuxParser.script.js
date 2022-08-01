var OperatingSystemLinuxParser = Class.create();
OperatingSystemLinuxParser.prototype = {

    OsType_linux: 'Linux',
    _amazonVendorName: 'Amazon',
    _canonicalVendorName: 'Canonical',
    _debianVendorName: 'Debian',
    _oracleVendorName: 'Oracle',
    _redhatVendorName: 'RedHat',
    _suseVendorName: 'SuSE',
    _fedoraVendorName: 'Fedora',

    UbuntuLinuxOSName: 'Ubuntu',

    _linuxDefaultName: 'Linux',

    osUtilInternal: new OperatingSystemInternal(),
    genericParser: new OperatingSystemGenericParser(),

    /**SNDOC
    @name getLinuxVendorCompany
	@description Get the vendor based on the OS name
    @param {string} [name] - (mandatory) the name of the operating system
    @return {GlideRecord} the vendor Glide Record
    */
    getLinuxVendorCompany: function (name) {
        if (!name) throw new Error('Invalid null argument for the parameter name in the getLinuxVendorCompany operation in the class OperatingSystemUtil');

        var linuxVendorNamePattern = /(CANONICAL UBUNTU|CANONICAL|UBUNTU|ORACLE|AMAZON|CENTOS|REDHAT|SUSE|DEBIAN|FEDORA)/i;
        var matchVendor = linuxVendorNamePattern.exec(name);
        var vendor = null;
        var vendorName;
        if (matchVendor) {
            var osParser = new OperatingSystemParser();
            nameToSearch = osParser.toProperCase(matchVendor[0]);
            if (nameToSearch.includes(this._canonicalVendorName) || nameToSearch.includes(this.UbuntuLinuxOSName)) {
                vendorName = this._canonicalVendorName;
            } else {
                vendorName = nameToSearch;
            }
            return this.osUtilInternal.getVendorCompany(vendorName);
        }
        return null;
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
                return this.UbuntuLinuxOSName;
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
        var osParser = new OperatingSystemParser();
        var server = osParser.isServerEdition(name);
        switch (vendorName) {
            case this._canonicalVendorName:
                return server ? 'Server' : 'Desktop';
            default:
                return null;
        }
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
        var vendorName = null;
        var grVendor = this.getLinuxVendorCompany(name);
        if (grVendor) {
            vendorSysId = grVendor.getUniqueValue();
            vendorName = grVendor.name.toString();
        }
        var productName = this.extractLinuxProductName(name, vendorName);
        var edition = this.extractLinuxEditionName(name, vendorName);

        var grOSModel = this.osUtilInternal.getOperatingSystemModelInternal(
            this.OsType_linux, objVersion.major, objVersion.minor, objVersion.review, objVersion.build, productName, edition, vendorSysId
        );
        if (grOSModel) {
            return grOSModel;
        } 
        return null;
    },
    /**SNDOC
    @name composeLinuxVersion
	@description TBD
    @param {string} [major] - the major version of the Linux version
    @param {string} [minor] - the minor version of the Linux version
    @param {string} [review] - the review version of the Linux version
    @param {string} [build] - the build version of the Linux version
    @param {string} [lifecycleManagementPolicy] - he lifecycle management policy of the Linux version
    @return {string} the formated Linux version
    */
    composeLinuxVersion: function (major, minor, review, build, lifecycleManagementPolicy) {
        return this.genericParser.composeGenericVersion(major, minor, review, build) + (lifecycleManagementPolicy ? ' ' + lifecycleManagementPolicy : '');
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

        var genericParser = new OperatingSystemGenericParser();
        var objVersion = genericParser.decomposeGenericVersion(version);
        var osParser = new OperatingSystemParser();
        var lifecycleManagementPolicy = osParser.extractLifecycleManagementPolicy(name) ||
            osParser.extractLifecycleManagementPolicy(version);
        if (objVersion) {
            objVersion.type = this.OsType_linux;
            objVersion.version = this.composeLinuxVersion(objVersion.major, objVersion.minor, objVersion.review, objVersion.build, lifecycleManagementPolicy);
            objVersion.lifecycleManagementPolicy = lifecycleManagementPolicy;

        }
        return objVersion;
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
        var vendorName = this.getLinuxVendorCompany(name);
        if (vendorName) {
            var grVendor = this.osUtilInternal.getVendorCompany(vendorName);
            if (grVendor) {
                vendorSysId = grVendor.getUniqueValue();
            }
        }
        var productName = this.extractLinuxProductName(name, vendorName);
        var edition = this.extractLinuxEditionName(name, vendorName);
        return this.osUtilInternal.createOperatingSystemModelInternal(
            this.OsType_linux,
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

    type: 'OperatingSystemLinuxParser',
};