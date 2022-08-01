var OperatingSystemAppleParser = Class.create();
OperatingSystemAppleParser.prototype = {

    OsType_ios: 'iOS',
    OsType_mac: 'macOS',
    _appleVendorName: 'Apple',
    _macOSDefaultName: 'macOS',
    _iOSDefaultName: 'iOS',

    osUtilInternal: new OperatingSystemInternal(),

    /**SNDOC
    @name getAppleVendorCompany
	@description Gets the Apple vendor company
    @return {GlideRecord} the record of the Apple vendor company
    */
    getAppleVendorCompany: function () {
        var vendor = this.osUtilInternal.getVendorCompany(this._appleVendorName);
        
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

        var grOSModel = this.osUtilInternal.getOperatingSystemModelInternal(this.OsType_ios, objVersion.major, objVersion.minor, objVersion.review, objVersion.build, null, null);
        if (grOSModel) return grOSModel;

        return null;
    },
    /**SNDOC
        @name getMacOperatingSystemModel
    	@description TBD
        @param {object} [objVersion] - (mandatory) the object representing the decomposed version
        @return {GlideRecord} the record of operating system model
        */
    getMacOperatingSystemModel: function (objVersion) {
        if (!objVersion) throw new Error('Invalid null argument for the parameter objVersion in the getMacOperatingSystemModel operation in the class OperatingSystemUtil');
        if (!(objVersion.major || objVersion.build)) throw new Error('Invalid null argument for the parameter objVersion.major in the getMacOperatingSystemModel operation in the class OperatingSystemUtil');

        var grOSModel = this.osUtilInternal.getOperatingSystemModelInternal(
            this.OsType_mac ,objVersion.major, objVersion.minor, objVersion.review, objVersion.build, this._macOSDefaultName, objVersion.edition, null, null);
        if (grOSModel) return grOSModel;

        return null;
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
        return this.osUtilInternal.createOperatingSystemModelInternal(
            this.OsType_ios,
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
    @name createMacOperatingSystemModel
	@description TBD
    @param {object} [objVersion] - (mandatory) the object representing the decomposed version
    @return {GlideRecord} the record of operating system model
    */
    createMacOperatingSystemModel: function (objVersion) {
        if (!objVersion) throw new Error('Invalid null argument for the parameter objVersion in the createMacOperatingSystemModel operation in the class OperatingSystemParser');
        if (!objVersion.major) throw new Error('Invalid null argument for the parameter objVersion.major in the createMacOperatingSystemModel operation in the class OperatingSystemParser');
        var grOsModel = this.getMacOperatingSystemModel(objVersion);
        if(grOsModel) {
            return grOsModel;
        }
        var grVendor = this.getAppleVendorCompany();
        var vendorSysId = grVendor ? grVendor.getUniqueValue() : null;
        return this.osUtilInternal.createOperatingSystemModelInternal(
            this.OsType_mac,
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
    @name composeAppleVersion
	@description TBD
    @param {string} [version] - (mandatory) the version of the operating system
    @return {object} Object with decomposed version in the field version, major, minor, review and build, betaRC, betaRCNumber
    */
    composeAppleVersion: function (major, minor, review, build, betaRC, betaRCNumber) {
        if (!major) return '';
        if (!minor) return '';
        return major + '.' + minor + (review !== '0' ? '.' + review : '') + (betaRC ? ' ' + betaRC + (betaRCNumber ? ' ' + betaRCNumber : '') : '') + (build ? ' (' + build + ')' : '');
    },
    /**SNDOC
    @name decomposeAppleVersion
	@description TBD
    @param {string} [version] - (mandatory) the version of the operating system
    @return {object} Object with decomposed version in the field version, major, minor, review and build, betaRC, betaRCNumber
    */
    decomposeAppleVersion: function (version) {
        if (!version) throw new Error('Invalid null argument for the parameter version in the decomposeAppleVersion operation in the class OperatingSystemUtil');
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
                version: this.composeAppleVersion(major, minor, review, build, betaRC, betaRCNumber) || version,
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
    @name decomposeMacVersion
	@description TBD
    @param {string} [version] - (mandatory) the version of the operating system
    @return {object} Object with decomposed version in the field version, major, minor, review and build, betaRC, betaRCNumber
    */
    decomposeMacVersion: function (version) {
        if (!version) throw new Error('Invalid null argument for the parameter version in the decomposeMacVersion operation in the class OperatingSystemUtil');

        var objVersion = this.decomposeAppleVersion(version);
        if (objVersion) {
            objVersion.type = this.OsType_mac;
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

        var objVersion = this.decomposeAppleVersion(version);
        if (objVersion) {
            objVersion.type = this.OsType_ios;
        }
        return objVersion;
    },

    type: 'OperatingSystemAppleParser'
};