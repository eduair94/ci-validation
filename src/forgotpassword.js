HTTP/1.1 200 OK
Connection: keep-alive
Last-Modified: Fri, 21 Mar 2025 23:03:20 GMT
X-Powered-By: Undertow/1
Server: WildFly/10
Content-Type: application/javascript
Content-Length: 12218
Accept-Ranges: bytes
Date: Wed, 13 Aug 2025 03:17:55 GMT

/**@preserve  GeneXus Java 10_3_13-119446 on March 6, 2025 23:47:56.71
*/
gx.evt.autoSkip = false;
gx.define('autogestion.wpauglogin', false, function () {
   this.ServerClass =  "autogestion.wpauglogin" ;
   this.PackageName =  "com.mgkwebfrontend" ;
   this.setObjectType("web");
   this.hasEnterEvent = true;
   this.skipOnEnter = false;
   this.autoRefresh = true;
   this.fullAjax = true;
   this.supportAjaxEvents =  true ;
   this.ajaxSecurityToken =  true ;
   this.SetStandaloneVars=function()
   {
      this.AV19sdtADMwsDpParametroIn=gx.fn.getControlValue("vSDTADMWSDPPARAMETROIN") ;
      this.AV74msgHelp=gx.fn.getControlValue("vMSGHELP") ;
      this.AV55Parametros=gx.fn.getControlValue("vPARAMETROS") ;
   };
   this.s112_client=function()
   {
      this.AV40sdtADMLicencia =  {LicCod:'',LicFchVal:'',LicenciaValida:''}  ;
      this.AV40sdtADMLicencia.LicCod =  this.AV41NombreLicencia  ;
      this.AV39sdtADMLicencias.push(this.AV40sdtADMLicencia) ;
   };
   this.e190d1_client=function()
   {
      this.clearMessages();
      this.addMessage("");
      this.TIMERMSGContainer.Enabled =  false  ;
      this.refreshOutputs([{ctrl:this.TIMERMSGContainer}]);
   };
   this.e180d1_client=function()
   {
      this.clearMessages();
      this.AV75window.Url =  gx.http.formatLink("com.mgkwebfrontend.autogestion.wpaugmensajepopup",["Ayuda", gx.text.trim( this.AV74msgHelp), "Cerrar", 1])  ;
      this.AV75window.ReturnParms =  []  ;
      this.AV75window.Autoresize = gx.num.trunc( false ,0) ;
      this.AV75window.Width = gx.num.trunc( 300 ,0) ;
      this.AV75window.Height = gx.num.trunc( 300 ,0) ;
      gx.popup.open(this.AV75window) ;
      this.refreshOutputs([]);
   };
   this.e130d2_client=function()
   {
      this.executeServerEvent("ENTER", true, null, false, false);
   };
   this.e140d2_client=function()
   {
      this.executeServerEvent("'FORGOTPASSWORD'", true, null, false, false);
   };
   this.e150d2_client=function()
   {
      this.executeServerEvent("'AYUDA'", true, null, false, false);
   };
   this.e160d2_client=function()
   {
      this.executeServerEvent("'NEWACCOUNT'", true, null, false, false);
   };
   this.e200d2_client=function()
   {
      this.executeServerEvent("CANCEL", true, null, false, false);
   };
   this.GXValidFnc = [];
   var GXValidFnc = this.GXValidFnc ;
   this.GXCtrlIds=[2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,27,28,30,31,32,33,34,35,36,37,38,39,40,41,42,43,45,46,47,48,49,50,51,52,54,55,56,59,61,64,66,69,70,71,72,73,74,75,77,78];
   this.GXLastCtrlId =78;
   this.CAPTCHAContainer = gx.uc.getNew(this, 44, 28, "Captcha", "CAPTCHAContainer", "Captcha");
   var CAPTCHAContainer = this.CAPTCHAContainer;
   CAPTCHAContainer.setProp("Width", "Width", "140", "str");
   CAPTCHAContainer.setProp("Height", "Height", "40", "str");
   CAPTCHAContainer.setProp("ReloadImageText", "Reloadimagetext", "Recargar imagen", "str");
   CAPTCHAContainer.setProp("ValidationResult", "Validationresult", 0, "num");
   CAPTCHAContainer.setProp("Visible", "Visible", true, "bool");
   CAPTCHAContainer.setProp("Enabled", "Enabled", true, "boolean");
   CAPTCHAContainer.setProp("Class", "Class", "", "char");
   CAPTCHAContainer.setC2ShowFunction(function(UC) { UC.show(); });
   this.setUserControl(CAPTCHAContainer);
   this.TIMERMSGContainer = gx.uc.getNew(this, 76, 28, "Timer", "TIMERMSGContainer", "Timermsg");
   var TIMERMSGContainer = this.TIMERMSGContainer;
   TIMERMSGContainer.setDynProp("Interval", "Interval", 10000, "num");
   TIMERMSGContainer.setDynProp("Enabled", "Enabled", true, "boolean");
   TIMERMSGContainer.setProp("Visible", "Visible", true, "bool");
   TIMERMSGContainer.setProp("Class", "Class", "", "char");
   TIMERMSGContainer.setC2ShowFunction(function(UC) { UC.start(); });
   TIMERMSGContainer.addEventHandler("Elapsed", this.e190d1_client);
   this.setUserControl(TIMERMSGContainer);
   this.JSRUNContainer = gx.uc.getNew(this, 79, 28, "JSRun", "JSRUNContainer", "Jsrun");
   var JSRUNContainer = this.JSRUNContainer;
   JSRUNContainer.setProp("Width", "Width", "100", "str");
   JSRUNContainer.setProp("Height", "Height", "100", "str");
   JSRUNContainer.setDynProp("JSCode", "Jscode", "", "str");
   JSRUNContainer.setProp("value", "Value", "", "str");
   JSRUNContainer.setProp("Visible", "Visible", true, "bool");
   JSRUNContainer.setProp("Enabled", "Enabled", true, "boolean");
   JSRUNContainer.setProp("Class", "Class", "", "char");
   JSRUNContainer.setC2ShowFunction(function(UC) { UC.show(); });
   this.setUserControl(JSRUNContainer);
   GXValidFnc[2]={fld:"",grid:0};
   GXValidFnc[3]={fld:"MAINTABLE",grid:0};
   GXValidFnc[4]={fld:"",grid:0};
   GXValidFnc[5]={fld:"",grid:0};
   GXValidFnc[6]={fld:"TABLE2",grid:0};
   GXValidFnc[7]={fld:"",grid:0};
   GXValidFnc[8]={fld:"FORMCONTAINER",grid:0};
   GXValidFnc[9]={fld:"TABLE1",grid:0};
   GXValidFnc[10]={fld:"",grid:0};
   GXValidFnc[11]={fld:"",grid:0};
   GXValidFnc[12]={fld:"TITULO", format:0,grid:0};
   GXValidFnc[13]={fld:"",grid:0};
   GXValidFnc[14]={fld:"",grid:0};
   GXValidFnc[15]={fld:"TABLE3",grid:0};
   GXValidFnc[16]={fld:"",grid:0};
   GXValidFnc[17]={fld:"",grid:0};
   GXValidFnc[18]={fld:"LOGO",grid:0};
   GXValidFnc[19]={fld:"",grid:0};
   GXValidFnc[20]={fld:"TXTAYUDACELL",grid:0};
   GXValidFnc[21]={fld:"TXTAYUDA", format:0,grid:0};
   GXValidFnc[22]={fld:"",grid:0};
   GXValidFnc[23]={fld:"",grid:0};
   GXValidFnc[24]={fld:"TABLEUSUARIO",grid:0};
   GXValidFnc[27]={fld:"",grid:0};
   GXValidFnc[28]={lvl:0,type:"char",len:20,dec:0,sign:false,ro:0,grid:0,gxgrid:null,fnc:null,isvalid:null,rgrid:[],fld:"vUSERNAME",gxz:"ZV5UserName",gxold:"OV5UserName",gxvar:"AV5UserName",ucs:[],op:[],ip:[],nacdep:[],ctrltype:"edit",v2v:function(Value){if(Value!==undefined)gx.O.AV5UserName=Value},v2z:function(Value){if(Value!==undefined)gx.O.ZV5UserName=Value},v2c:function(){gx.fn.setControlValue("vUSERNAME",gx.O.AV5UserName,0)},c2v:function(){if(this.val()!==undefined)gx.O.AV5UserName=this.val()},val:function(){return gx.fn.getControlValue("vUSERNAME")},nac:gx.falseFn};
   GXValidFnc[30]={fld:"ICONOAYUDA", format:1,grid:0};
   GXValidFnc[31]={fld:"",grid:0};
   GXValidFnc[32]={fld:"",grid:0};
   GXValidFnc[33]={fld:"",grid:0};
   GXValidFnc[34]={lvl:0,type:"char",len:20,dec:0,sign:false,isPwd:true,ro:0,grid:0,gxgrid:null,fnc:null,isvalid:null,rgrid:[],fld:"vPASSWORD",gxz:"ZV6Password",gxold:"OV6Password",gxvar:"AV6Password",ucs:[],op:[],ip:[],nacdep:[],ctrltype:"edit",v2v:function(Value){if(Value!==undefined)gx.O.AV6Password=Value},v2z:function(Value){if(Value!==undefined)gx.O.ZV6Password=Value},v2c:function(){gx.fn.setControlValue("vPASSWORD",gx.O.AV6Password,0)},c2v:function(){if(this.val()!==undefined)gx.O.AV6Password=this.val()},val:function(){return gx.fn.getControlValue("vPASSWORD")},nac:gx.falseFn};
   GXValidFnc[35]={fld:"",grid:0};
   GXValidFnc[36]={fld:"",grid:0};
   GXValidFnc[37]={fld:"",grid:0};
   GXValidFnc[38]={lvl:0,type:"char",len:20,dec:0,sign:false,ro:0,grid:0,gxgrid:null,fnc:null,isvalid:null,rgrid:[],fld:"vISMOBILE",gxz:"ZV80isMobile",gxold:"OV80isMobile",gxvar:"AV80isMobile",ucs:[],op:[],ip:[],nacdep:[],ctrltype:"edit",v2v:function(Value){if(Value!==undefined)gx.O.AV80isMobile=Value},v2z:function(Value){if(Value!==undefined)gx.O.ZV80isMobile=Value},v2c:function(){gx.fn.setControlValue("vISMOBILE",gx.O.AV80isMobile,0)},c2v:function(){if(this.val()!==undefined)gx.O.AV80isMobile=this.val()},val:function(){return gx.fn.getControlValue("vISMOBILE")},nac:gx.falseFn};
   GXValidFnc[39]={fld:"",grid:0};
   GXValidFnc[40]={fld:"",grid:0};
   GXValidFnc[41]={fld:"TABLACAPTCHA",grid:0};
   GXValidFnc[42]={fld:"",grid:0};
   GXValidFnc[43]={fld:"",grid:0};
   GXValidFnc[45]={fld:"",grid:0};
   GXValidFnc[46]={fld:"",grid:0};
   GXValidFnc[47]={fld:"TABLE4",grid:0};
   GXValidFnc[48]={fld:"",grid:0};
   GXValidFnc[49]={fld:"",grid:0};
   GXValidFnc[50]={fld:"MENSAJEERROR", format:0,grid:0};
   GXValidFnc[51]={fld:"",grid:0};
   GXValidFnc[52]={fld:"",grid:0};
   GXValidFnc[54]={fld:"",grid:0};
   GXValidFnc[55]={fld:"",grid:0};
   GXValidFnc[56]={fld:"TABLE5",grid:0};
   GXValidFnc[59]={fld:"NEWACCOUNTTXT", format:0,grid:0};
   GXValidFnc[61]={fld:"SEPARADOR1",grid:0};
   GXValidFnc[64]={fld:"TEXTBLOCK3", format:0,grid:0};
   GXValidFnc[66]={fld:"SEPARADOR2",grid:0};
   GXValidFnc[69]={fld:"AYUDA", format:0,grid:0};
   GXValidFnc[70]={fld:"",grid:0};
   GXValidFnc[71]={fld:"",grid:0};
   GXValidFnc[72]={fld:"",grid:0};
   GXValidFnc[73]={lvl:0,type:"char",len:1,dec:0,sign:false,ro:0,grid:0,gxgrid:null,fnc:null,isvalid:null,rgrid:[],fld:"vMOSTRARCAPTCHA",gxz:"ZV24MostrarCaptcha",gxold:"OV24MostrarCaptcha",gxvar:"AV24MostrarCaptcha",ucs:[],op:[],ip:[],nacdep:[],ctrltype:"edit",v2v:function(Value){if(Value!==undefined)gx.O.AV24MostrarCaptcha=Value},v2z:function(Value){if(Value!==undefined)gx.O.ZV24MostrarCaptcha=Value},v2c:function(){gx.fn.setControlValue("vMOSTRARCAPTCHA",gx.O.AV24MostrarCaptcha,0)},c2v:function(){if(this.val()!==undefined)gx.O.AV24MostrarCaptcha=this.val()},val:function(){return gx.fn.getControlValue("vMOSTRARCAPTCHA")},nac:gx.falseFn};
   GXValidFnc[74]={fld:"",grid:0};
   GXValidFnc[75]={fld:"",grid:0};
   GXValidFnc[77]={fld:"",grid:0};
   GXValidFnc[78]={fld:"",grid:0};
   this.AV5UserName = "" ;
   this.ZV5UserName = "" ;
   this.OV5UserName = "" ;
   this.AV6Password = "" ;
   this.ZV6Password = "" ;
   this.OV6Password = "" ;
   this.AV80isMobile = "" ;
   this.ZV80isMobile = "" ;
   this.OV80isMobile = "" ;
   this.AV24MostrarCaptcha = "" ;
   this.ZV24MostrarCaptcha = "" ;
   this.OV24MostrarCaptcha = "" ;
   this.AV5UserName = "" ;
   this.AV6Password = "" ;
   this.AV80isMobile = "" ;
   this.AV24MostrarCaptcha = "" ;
   this.AV55Parametros = "" ;
   this.AV19sdtADMwsDpParametroIn = {} ;
   this.AV74msgHelp = "" ;
   this.AV41NombreLicencia = "" ;
   this.AV40sdtADMLicencia = {} ;
   this.AV75window = {} ;
   this.Events = {"e130d2_client": ["ENTER", true] ,"e140d2_client": ["'FORGOTPASSWORD'", true] ,"e150d2_client": ["'AYUDA'", true] ,"e160d2_client": ["'NEWACCOUNT'", true] ,"e200d2_client": ["CANCEL", true] ,"e190d1_client": ["TIMERMSG.ELAPSED", false] ,"e180d1_client": ["'AYUDAUSUARIO'", false]};
   this.EvtParms["REFRESH"] = [[{av:'AV19sdtADMwsDpParametroIn',fld:'vSDTADMWSDPPARAMETROIN',pic:'',nv:null}],[{av:'this.JSRUNContainer.JSCode',ctrl:'JSRUN',prop:'JSCode'},{av:'AV19sdtADMwsDpParametroIn',fld:'vSDTADMWSDPPARAMETROIN',pic:'',nv:null},{av:'this.TIMERMSGContainer.Interval',ctrl:'TIMERMSG',prop:'Interval'},{av:'this.TIMERMSGContainer.Enabled',ctrl:'TIMERMSG',prop:'Enabled'}]];
   this.EvtParms["ENTER"] = [[{av:'AV5UserName',fld:'vUSERNAME',pic:'',nv:''},{av:'AV6Password',fld:'vPASSWORD',pic:'',nv:''},{av:'AV19sdtADMwsDpParametroIn',fld:'vSDTADMWSDPPARAMETROIN',pic:'',nv:null},{av:'AV24MostrarCaptcha',fld:'vMOSTRARCAPTCHA',pic:'',nv:''},{av:'this.CAPTCHAContainer.ValidationResult',ctrl:'CAPTCHA',prop:'ValidationResult'},{av:'AV80isMobile',fld:'vISMOBILE',pic:'',nv:''}],[{av:'gx.fn.getCtrlProperty("MENSAJEERROR","Caption")',ctrl:'MENSAJEERROR',prop:'Caption'},{av:'AV19sdtADMwsDpParametroIn',fld:'vSDTADMWSDPPARAMETROIN',pic:'',nv:null},{av:'this.TIMERMSGContainer.Interval',ctrl:'TIMERMSG',prop:'Interval'},{av:'this.TIMERMSGContainer.Enabled',ctrl:'TIMERMSG',prop:'Enabled'}]];
   this.EvtParms["'FORGOTPASSWORD'"] = [[],[]];
   this.EvtParms["'AYUDA'"] = [[],[]];
   this.EvtParms["'NEWACCOUNT'"] = [[],[]];
   this.EvtParms["TIMERMSG.ELAPSED"] = [[],[{av:'this.TIMERMSGContainer.Enabled',ctrl:'TIMERMSG',prop:'Enabled'}]];
   this.EvtParms["'AYUDAUSUARIO'"] = [[{av:'AV74msgHelp',fld:'vMSGHELP',pic:'',nv:''}],[]];
   this.EnterCtrl = ["INGRESAR"];
   this.setVCMap("AV19sdtADMwsDpParametroIn", "vSDTADMWSDPPARAMETROIN", 0, "Administracion\sdtADMwsDpParametroIn");
   this.setVCMap("AV74msgHelp", "vMSGHELP", 0, "svchar");
   this.setVCMap("AV55Parametros", "vPARAMETROS", 0, "vchar");
   this.InitStandaloneVars( );
});
gx.createParentObj(autogestion.wpauglogin);
