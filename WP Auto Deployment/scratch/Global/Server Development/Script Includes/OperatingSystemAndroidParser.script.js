/* global SNC */

var OperatingSystemAndroidParser = Class.create();
OperatingSystemAndroidParser.prototype = {

    OsType_android: 'Android',
    _googleVendorName: 'Google',
    _androidDefaultName: 'Android',

    initialize: function () {
        this.osUtilInternal = new OperatingSystemInternal();
    },
    /**SNDOC
     @name getGoogleVendorCompany
     @description Gets the Google vendor company
     @return {GlideRecord} the record of the Google vendor company
     */
    getGoogleVendorCompany: function () {
        return this.osUtilInternal.getVendorCompany(this._googleVendorName);
    },
    /**SNDOC
    @name getAndroidOperatingSystemModel
	@description TBD
    @param {object} [objVersion] - (mandatory) the object representing the decomposed version
    @return {GlideRecord} the record of operating system model
    */
    getAndroidOperatingSystemModel: function (objVersion) {
        if (!objVersion) throw new Error('Invalid null argument for the parameter objVersion in the getAndroidOperatingSystemModel operation in the class OperatingSystemUtil');

        var grOSModel = this.osUtilInternal.getOperatingSystemModelInternal(this.OsType_android, objVersion.major, objVersion.minor, objVersion.review, objVersion.build, null, null);
        if (grOSModel) return grOSModel;

        return null;
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
        return this.osUtilInternal.createOperatingSystemModelInternal(
            this.OsType_android,
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
                type: this.OsType_android,
                version: this.composeAndroidVersionInternal(major, minor, review) || version,
                major: major,
                minor: minor,
                review: review
            };
        } else {
            return null;
        }
    },
    type: 'OperatingSystemAndroidParser'
};