var grOS = new GlideRecord('u_cmdb_operating_system_product_model');
grOS.query();
count = 0;
while (count < 1000 && grOS.next()) {
    var grCIOS = new GlideRecord('u_cmdb_ci_operating_system');
    grCIOS.addQuery('model_id', grOS.sys_id);
    grCIOS.query();
    if (grCIOS.next()) {
        gs.info(grOS.getDisplayValue() + ' - has CI');
    } else {
        grOS.deleteRecord();
    }
    count++;
}








/*
call OS discovery routines
*/

name = 'windows';
version = '10.0.22000.795';


var osUtil = new global.OperatingSystemUtil();
var type = osUtil.cleanseOperatingSystemType(name); //getOrCreateOperatingSystemModel




var grOSModel = osUtil.getOperatingSystemModel(type, name, version);

//if (!grOSModel) grOSModel = this.createOperatingSystemModel(type, name, version);

//        if (grOSModel) return grOSModel.getUniqueValue();


//return { grOSModel: grOSModel, name: name, version: version, type: type }

grOSModel.query();
while (grOSModel.next() ) {
  gs.info(grOSModel.getDisplayValue());
}

grOSModel;










/*
    count distinct operating systems used by comnputers
*/

var gr = new GlideAggregate('u_cmdb_ci_operating_system');
gr.groupBy('model_id');
gr.addAggregate('count');
gr.orderBy('model_id');
//gr.setLimit(100);
//gr.setWorkflow(false);
//gr.autoSysFields(false);
gr.query();

while (gr.next()) {
  gs.info(gr.model_id.display_name.toString() + ' = ' + gr.getAggregate('count'));
  
}

