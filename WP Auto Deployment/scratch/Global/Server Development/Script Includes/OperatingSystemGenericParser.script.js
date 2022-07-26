var OperatingSystemGenericParser = Class.create();
OperatingSystemGenericParser.prototype = {
    OsType_generic: 'Generic',
    
    osUtilInternal: new OperatingSystemInternal(),

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

        var grOSModel = this.osUtilInternal.getOperatingSystemModelInternal(this.OsType_generic, objVersion.major, objVersion.minor, objVersion.review, objVersion.build, name, null);
        if (grOSModel) return grOSModel;

        return null;
    },
    /**SNDOC
    @name composeGenericVersion
	@description TBD
    @param {string} [version] - (mandatory) the version of the operating system
    @return {object} Object with decomposed version in the field version, major, minor, review and build, betaRC, betaRCNumber
    */
    composeGenericVersion: function (major, minor, review, build) {
        if (!major) return '';
        return major + (minor ? '.' + minor + (review ? '.' + review + (build ? '.' + build : '') : '') : '');
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
                type: this.OsType_generic,
                version: this.composeGenericVersion(major, minor, review, build),
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
    @name composeGenericDisplayName
	@description TBD
    @param {string} [vendorName] the name of the operating system
    @param {string} [name] the name of the operating system
    @param {string} [version] the name of the operating system
    @return {string} the composed generic display name
    */
    composeGenericDisplayName: function (vendorName, name, edition, version, lifecycleManagementPolicy) {
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
    type: 'OperatingSystemGenericParser',
};