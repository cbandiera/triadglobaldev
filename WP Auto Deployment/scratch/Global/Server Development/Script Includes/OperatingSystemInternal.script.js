/* global SNC */

var OperatingSystemInternal = Class.create();
OperatingSystemInternal.prototype = {
    initialize: function () {},
    /**SNDOC
    @name getOperatingSystemModelInternal
	@description Retriueve the operating system model from the database
    @param {string} [type] the type of the operating system (Mac, Windows, Linux, Unix, iOS, Androide, Generic)
    @param {string} [major] the version major element of the operating system
    @param {string} [minor] the version minor element of the operating system
    @param {string} [review] the version review element of the operating system
    @param {string} [build] the version build element of the operating system
    @param {string} [name] the name of the operating system
    @param {string} [edition] the edition of the operating system
    @return {GlideRecord} the record of operating system model
    */
    getOperatingSystemModelInternal: function (type, major, minor, review, build, name, edition, vendorSysId, codebase) {
        if (!type) throw new Error('Invalid null argument for the parameter type in the getOperatingSystemModelInternal operation in the class OperatingSystemUtil');
        grOSModel = new GlideRecord('u_cmdb_operating_system_product_model');
        grOSModel.setLimit(1);
        grOSModel.addQuery('type', type);
        if (major) grOSModel.addQuery('major_version', major);
        if (minor) grOSModel.addQuery('minor_version', minor);
        if (review) grOSModel.addQuery('review_version', review);
        if (build) grOSModel.addQuery('build_version', build);
        if (codebase) grOSModel.addQuery('short_description', codebase);
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
    @name getVendorCompany
	@description Gets the vendor company
    @param {string} [name] the name of the vendor company
    @return {GlideRecord} the record of the vendor company
    */
    getVendorCompanyInternal: function (name) {
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
        gs.error('OperatingSystemUtil.getVendorCompany() - Vendor ' + name + ' not found in core_company table');
        return null;
    },
    type: 'OperatingSystemInternal',
};