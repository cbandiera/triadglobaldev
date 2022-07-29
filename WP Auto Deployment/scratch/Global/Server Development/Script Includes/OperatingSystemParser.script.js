/* global SNC */

var OperatingSystemParser = Class.create();
OperatingSystemParser.prototype = {

    linuxParser: new OperatingSystemLinuxParser(),
    unixParser: new OperatingSystemUnixParser(),
    appleParser: new OperatingSystemAppleParser(),
    windowsParser: new OperatingSystemWinParser(),
    androidParser: new OperatingSystemAndroidParser(),
    genericParser: new OperatingSystemGenericParser(),

    /**SNDOC
    @name cleanseOperatingSystemType
    @param {string} [name] - (mandatory) the name of the operating system
	@description based on the os Name, return the os Type
    @return {string} operating system type
    */
    cleanseOperatingSystemType: function (name) {
        var osTypePattern = /\b(WINDOWS|MAC|MACOS|IOS|UNIX|LINUX|UBUNTU|UNIX|ANDROID)/ig;
        var osTypeMatch = osTypePattern.exec(name);
        if (osTypeMatch) {
            var osTypeFound = osTypeMatch[1].toUpperCase();
            switch (osTypeFound) {
                case this.windowsParser.OsType_windows.toUpperCase():
                    return this.windowsParser.OsType_windows;

                case this.linuxParser.OsType_linux.toUpperCase():
                case this.linuxParser.UbuntuLinuxOSName.toUpperCase():
                    return this.linuxParser.OsType_linux;

                case this.androidParser.OsType_android.toUpperCase():
                    return this.androidParser.OsType_android;

                case this.unixParser.OsType_unix.toUpperCase():
                    return this.unixParser.OsType_unix;

                case this.appleParser.OsType_ios.toUpperCase():
                    return this.appleParser.OsType_ios;

                case this.appleParser.OsType_mac.toUpperCase():
                case 'MACOS':
                    return this.appleParser.OsType_mac;

            }
        }
        return this.genericParser.OsType_generic;
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
    @name getOperatingSystemModel
	@description Gets the Entitled To::Allowed For relationship sys_id
    @param {string} [type] - (mandatory) the type of the operating system (Mac, Windows, Linux, Unix, iOS, Androide, Generic)
    @param {string} [name] - (mandatory) the name of the operating system
    @param {string} [version] - (mandatory) the version of the operating system
    @return {string} The Entitled To::Allowed For relationship sys_id
    */
    getOperatingSystemModel: function (type, name, version) {
        if (!type) throw new Error('Invalid null argument for the parameter type in the getOperatingSystemModel operation in the class OperatingSystemParser');
        // if (!name) throw new Error('Invalid null argument for the parameter name in the getOperatingSystemModel operation in the class OperatingSystemParser');
        if (!version) throw new Error('Invalid null argument for the parameter version in the getOperatingSystemModel operation in the class OperatingSystemParser');

        var objVersion = this.decomposeVersion(type, name, version);
        if (objVersion) {
            switch (type) {
                case this.appleParser.OsType_mac:
                    return this.appleParser.getMacOperatingSystemModel(objVersion);
                case this.appleParser.OsType_ios:
                    return this.appleParser.getiOSOperatingSystemModel(objVersion);
                case this.androidParser.OsType_android:
                    return this.androidParser.getAndroidOperatingSystemModel(objVersion);
                case this.windowsParser.OsType_windows:
                    return this.windowsParser.getWindowsOperatingSystemModel(name, objVersion);
                case this.linuxParser.OsType_linux:
                    return this.linuxParser.getLinuxOperatingSystemModel(name, objVersion);
                case this.unixParser.OsType_unix:
                    return this.unixParser.getUnixOperatingSystemModel(name, objVersion);
                case this.genericParser.OsType_generic:
                    return this.genericParser.getGenericOperatingSystemModel(name, objVersion);
                default:
                    return null;
            }
        }
        return null;
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
        if (!type) throw new Error('Invalid null argument for the parameter type in the createOperatingSystemModel operation in the class OperatingSystemParser');
        // if (!name) throw new Error('Invalid null argument for the parameter name in the createOperatingSystemModel operation in the class OperatingSystemParser');
        if (!version) throw new Error('Invalid null argument for the parameter version in the createOperatingSystemModel operation in the class OperatingSystemParser');

        var grOsModel = this.getOperatingSystemModel(type, name, version);
        if( grOsModel ) {
            return grOsModel;
        }

        var objVersion = this.decomposeVersion(type, name, version);
        switch (type) {
            case this.appleParser.OsType_mac:
                return this.appleParser.createMacOperatingSystemModel(objVersion);
            case this.appleParser.OsType_ios:
                return this.appleParser.createiOSOperatingSystemModel(objVersion);
            case this.windowsParser.OsType_windows:
                return this.windowsParser.createWindowsOperatingSystemModel(name, objVersion);
            case this.androidParser.OsType_android:
                return this.androidParser.createAndroidOperatingSystemModel(objVersion);
            case this.linuxParser.OsType_linux:
                return this.linuxParser.createLinuxOperatingSystemModel(name, objVersion);
            case this.unixParser.OsType_unix:
                return this.unixParser.createUnixOperatingSystemModel(name, objVersion);
            default:
                throw new Error('Generic or unknow OS type creation is not allowed');
        }
    },
    /**SNDOC
    @name composeVersion
	@description TBD
    @param {string} [type] - (mandatory) the type of the operating system (Mac, Windows, Linux, Unix, iOS, Androide, Generic)
    @param {string} [major] - major version number
    @param {string} [minor] - minor version number
    @param {string} [review] - review 
    @param {string} [build] - build
    @param {string} [lifecycleManagementPolicy] - Life Cycle
    @param {string} [betaRC] - 
    @param {string} [betaRCNumber] - 
    @return {object} Object with decomposed version in the field version, major, minor, review and build, betaRC, betaRCNumber
    */
    composeVersion: function (type, major, minor, review, build, lifecycleManagementPolicy, betaRC, betaRCNumber) {
        if (!type) throw new Error('Invalid null argument for the parameter type in the composeVersion operation in the class OperatingSystemParser');
        switch (type) {                        
            case this.appleParser.OsType_mac:
            case this.appleParser.OsType_ios:
                return this.appleParser.composeAppleVersion(major, minor, review, build, betaRC, betaRCNumber);
            case this.windowsParser.OsType_windows:
                return this.windowsParser.composeMicrosoftVersion(major, minor, build);
            case this.linuxParser.OsType_linux:
                return this.linuxParser.composeLinuxVersion(major, minor, review, build, lifecycleManagementPolicy);
            case this.androidParser.OsType_android:                        
                return this.androidParser.composeAndroidVersion(major, minor, review);
            case this.unixParser.OsType_unix:
            case this.genericParser.OsType_generic:
                return this.genericParser.composeGenericVersion(major, minor, review, build);
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
        if (!type) throw new Error('Invalid null argument for the parameter type in the decomposeVersion operation in the class OperatingSystemParser');
        if (!version) throw new Error('Invalid null argument for the parameter version in the decomposeVersion operation in the class OperatingSystemParser');

        switch (type) {
            case this.appleParser.OsType_mac:
                return this.appleParser.decomposeMacVersion(version);
            case this.windowsParser.OsType_windows:
                return this.windowsParser.decomposeWindowsVersion(name, version);
            case this.linuxParser.OsType_linux:
                return this.linuxParser.decomposeLinuxVersion(name, version);
            case this.unixParser.OsType_unix:
                return this.unixParser.decomposeUnixVersion(name, version);
            case this.appleParser.OsType_ios:
                return this.appleParser.decomposeIOSVersion(version);
            case this.androidParser.OsType_android:                        
                return this.androidParser.decomposeAndroidVersion(version);
            default:
                return this.genericParser.decomposeGenericVersion(version);
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
    type: 'OperatingSystemParser'
};