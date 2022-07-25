/* global SNC */

var OperatingSystemUnixParser = Class.create();
OperatingSystemUnixParser.prototype = {

    OsType_unix: 'Unix',
    _unixDefaultName: 'Unix',
    _ibmVendorName: 'IBM',
    _hpVendorName: 'HP',

    _aixDefaultName: 'AIX',
    _hpuxDefaultName: 'HPUX',
    _solarisDefaultName: 'Solaris',

    osUtilInternal: new OperatingSystemInternal(),

    initialize: function () {
        this.osUtilInternal = new OperatingSystemInternal();
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
            var grVendor = this.osUtilInternal.getVendorCompany(vendorName);
            if (grVendor) {
                vendorSysId = grVendor.getUniqueValue();
            }
        }
        var productName = this.extractUnixProductName(vendorName);
        var grOSModel = this.osUtilInternal.getOperatingSystemModelInternal(this.OsType_unix, objVersion.major, objVersion.minor, objVersion.review, objVersion.build, productName, null, vendorSysId);
        if (grOSModel) return grOSModel;

        return null;
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
            objVersion.type = this.OsType_unix;
        }
        return objVersion;
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
            var grVendor = this.osUtilInternal.getVendorCompany(vendorName);
            if (grVendor) {
                vendorSysId = grVendor.getUniqueValue();
            }
        }
        var productName = this.extractUnixProductName(vendorName);
        return this.osUtilInternal.createOperatingSystemModelInternal(
            this.OsType_unix,
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
    type: 'OperatingSystemUnixParser',
};