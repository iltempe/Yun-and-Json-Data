$(document).ready(function(e) {
    
    
    // pins default to input, no pull-up
    // Analog pins always defined as input in this example

    
    // set up variables and hide the loading/saving floating DIV
    
    $.ajaxSetup({ cache: false });  // turn off Ajax caching
    
    $('#loadingall').hide();

    var isAutoRefreshP4 = false;
    var timerP4;
    
    var isAutoRefreshP5 = false;
    var timerP5;
    
    // page 2 always has the digital pin data directions - load once only   
    // Note, for YUN, keep digital 0 and digital 1 reserved for arduino <-> linux exchange
    // so that pins shown are D2 ... D13
    populate_page2();
    initpage2();        // now initialise their states
    

// *****************************************************************************    
//                      PAGE 2 FUNCTIONS
// *****************************************************************************    
        
    // set up the radio groups to allow pin data direction selection
    // between output, input and input with internal pull-up enabled
    function populate_page2()
    {
        $('#setdigital_io').empty();    // empty the div

/*
//  PROTOTYPE IS
    
<div id="radiogroupX" data-role="fieldcontain">
    <fieldset data-role="controlgroup" data-type="horizontal">
        <legend>Digital Pin X</legend>
            <input type="radio" name="radio-choice-dX" id="radio-choice-dX1" value="choice-X1" checked="checked" />
            <label for="radio-choice-dX1">Output</label>

            <input type="radio" name="radio-choice-dX" id="radio-choice-dX2" value="choice-X2"  />
            <label for="radio-choice-dX2">Input</label>

            <input type="radio" name="radio-choice-dX" id="radio-choice-dX3" value="choice-X3"  />
            <label for="radio-choice-dX3">Input (pull-up)</label>

    </fieldset>
</div>      
*/      
        for (var i=2;i<=13;i++)
        {
            var labStr = "D"+i.toString();
            
            $('#setdigital_io').append('<div id="radiogroup'+i+'" data-role="fieldcontain"><fieldset data-role="controlgroup" data-type="horizontal" data-mini="false"><legend>'+labStr+'</legend><input type="radio" name="radio-choice-d'+i+'" id="radio-choice-d'+i+'1" value="choice-'+i+'1" checked="checked"/><label for="radio-choice-d'+i+'1">Output</label><input type="radio" name="radio-choice-d'+i+'" id="radio-choice-d'+i+'2" value="choice-'+i+'2"/><label for="radio-choice-d'+i+'2">Input</label><input type="radio" name="radio-choice-d'+i+'" id="radio-choice-d'+i+'3" value="choice-'+i+'3"/><label for="radio-choice-d'+i+'3">Input (PU)</label></fieldset></div>'   );
        }
        
        $('#setdigital_io').trigger('create');  // trigger a create on parent div to make sure the label and buttons are rendered correctly
        
        blankpage2();   // reset all choices
    
    }
    
    
    // when page 2 selected from the main menu call the function to read the
    // current data directions and update the radio selections 
    $('#callinitp2').click(function() {initpage2();});
    
    
    // function to make a call to the Yun and use the JSON data sent back to initialise the
    // radio selections
    function initpage2()
    {
        $('#loadingall').html('...Loading');
        $('#loadingall').show();
        //$.getJSON("V_io_test.json",function(data){    // swap this for line below to test locally
        $.getJSON("/arduino/in/",function(data){        // send the in command to the Yun
        var j=2;
        $.each(data.Datadir,            // loop through response and update as required
            function (key,value)
            {
                if (value.datadir==0) {$('#radio-choice-d'+j+'1').prop("checked",true).checkboxradio( "refresh" );}else{$('#radio-choice-d'+j+'1').prop("checked",false).checkboxradio( "refresh" );}
                if (value.datadir==1) {$('#radio-choice-d'+j+'2').prop("checked",true).checkboxradio( "refresh" );}else{$('#radio-choice-d'+j+'2').prop("checked",false).checkboxradio( "refresh" );}
                if (value.datadir==2) {$('#radio-choice-d'+j+'3').prop("checked",true).checkboxradio( "refresh" );}else{$('#radio-choice-d'+j+'3').prop("checked",false).checkboxradio( "refresh" );}
                j++;
            });
            $('#loadingall').hide();
        }); 
    }
    
    
    // this function unchecks all the radio selections for page 2
    function blankpage2()
    {
        for (var j=2;j<=13;j++)
        {
            $('#radio-choice-d'+j+'1').prop("checked",false).checkboxradio( "refresh" );
            $('#radio-choice-d'+j+'2').prop("checked",false).checkboxradio( "refresh" );
            $('#radio-choice-d'+j+'3').prop("checked",false).checkboxradio( "refresh" );
        }
    }
    
    
    
    // Send new data direction to Yun
    //
    // string sent to arduino is of the form
    //  /arduino/io/012012012012/
    //
    //  0: pin is output
    //  1: pin is input
    //  2: pin is input with pull-up

    $('#save_io').click(function() {
        
        var urlStr="/arduino"+doSaveStateDir();
        
        $('#loadingall').html('...Saving');
        $('#loadingall').show();
    
        //$.getJSON("stat.json",function(data){ // swap this for line below to test locally
        $.getJSON(urlStr,function(data){
            //alert(data.ret);
            $('#loadingall').hide();
        });
    });
    
    
    // construct the save-state string to send
    function doSaveStateDir(){
        
        var RVal="/io/";
        for (var j=2;j<=13;j++)
        {
            RVal+=getRadioStateDDir('#radio-choice-d'+j);
        }
        RVal+="/";
        
        return RVal;
    }           
    
    // this returns a value of 0, 1 or 2 depending on the selection in the given radio group 
    function getRadioStateDDir(RGSelection)
    {
        var k=0;
        k=1*Number($(RGSelection+'1').prop("checked"));
        k+=2*Number($(RGSelection+'2').prop("checked"));
        k+=3*Number($(RGSelection+'3').prop("checked"));
        return (k-1).toString();    
    }       



// *****************************************************************************    
//                      PAGE 3 FUNCTIONS
// *****************************************************************************    


    // when page 3 selected from the main menu call the function to read the
    // current digital ouput values and update the radio selections 
    $('#callinitp3').click(function() {initpage3();});
    
    // function to make a call to the Yun and use the JSON data sent back to initialise the
    // radio selections for the current digital output values
    function initpage3()
    {
        $('#loadingall').html('...Loading');
        $('#loadingall').show();

        //$.getJSON("V_io_test.json",function(data){    // swap this for line below to test locally
        $.getJSON("/arduino/in/",function(data){
        $('#setdigital_vals').empty();  // empty the div
        var j=2;
        $.each(data.Digital,
            function (key,value)    // 0/1 digital pin is output with value 0/1     10/11 digital pin is input with value 0/1
            {
                var labStr = "D"+j.toString();
                
                if (value.dataval==0 || value.dataval==1)   // output - add slider on page
                {
                    $('#setdigital_vals').append('<div id="radiogroup'+j+'" data-role="fieldcontain"><fieldset data-role="controlgroup" data-type="horizontal" data-mini="false"><legend>'+labStr+'</legend><input type="radio" name="radio-val-d'+j+'" id="radio-val-d'+j+'1" value="val-'+j+'1" checked="checked"/><label for="radio-val-d'+j+'1">High</label><input type="radio" name="radio-val-d'+j+'" id="radio-val-d'+j+'2" value="val-'+j+'2"/><label for="radio-val-d'+j+'2">Low</label></fieldset></div>' );

                    $('#setdigital_vals').trigger('create');
                    
                    if (value.dataval==1) {$('#radio-val-d'+j+'1').prop("checked",true).checkboxradio( "refresh" );}else{$('#radio-val-d'+j+'1').prop("checked",false).checkboxradio( "refresh" );}
                    if (value.dataval==0) {$('#radio-val-d'+j+'2').prop("checked",true).checkboxradio( "refresh" );}else{$('#radio-val-d'+j+'2').prop("checked",false).checkboxradio( "refresh" );}
                        
                }
                
                j++;
            });
    
            $('#loadingall').hide();

        }); // getJSON
        $('#setdigital_vals').trigger('create');    // trigger a create on parent div to make sure the label and buttons are rendered correctly
    
        // going through radio objects here won't work as the getJASON is async and items won't be defined.
    
    }

    // Send new data values to Yun
    //
    // string sent to arduino is
    //  /arduino/do/010101010101/
    //
    //  0: set pin LOW if output
    //  1: set pin HIGH if output
    
    $('#change_io').click(function() {
        
        var urlStr="/arduino"+doSaveStateOut();
        
        $('#loadingall').html('...Saving');
        $('#loadingall').show();
        
        //$.getJSON("stat.json",function(data){ // swap this for line below to test locally
        $.getJSON(urlStr,function(data){
            //alert(data.ret);
            $('#loadingall').hide();
        });
    });
    

    // construct the save-state string to send
    function doSaveStateOut(){
        
        var RVal="/do/";
    
        for (var j=2;j<=13;j++)
        {
            if ($('#radio-val-d'+j+'1').length>0)
            {
                RVal+=getRadioStateDVal('#radio-val-d'+j);
            }
            else
            {
                RVal+="-";
            }
        }   
        RVal+="/";
        
        return RVal;
    }


    // this returns a value of 0 or 1 depending on the selection in the given radio group 
    function getRadioStateDVal(RGSelection)
    {
        var k=0;
        k=1*Number($(RGSelection+'2').prop("checked"));
        k+=2*Number($(RGSelection+'1').prop("checked"));
        return (k-1).toString();    
    }


// *****************************************************************************    
//                      PAGE 4 FUNCTIONS
// *****************************************************************************    

    
    // when page 4 selected from the main menu call the function to read the
    // current digital input values and show the results 
    $('#callinitp4').click(function() {initpage4(0);});
    
    // function to make a call to the Yun and use the JSON data sent back to display
    // the current digital input values
    function initpage4(option)
    {
        // call with 0 to display div - used for initialisation and manual refresh
        // call with 1 to keep div hidden - used for auto refresh
        $('#loadingall').html('...Loading');
        if (option==0)  $('#loadingall').show();

        //$.getJSON("V_io_test.json",function(data){    // swap this for line below to test locally
        $.getJSON("/arduino/in/",function(data){
        $('#readdigital_vals').empty(); // empty the div
        var j=2;
        $.each(data.Digital,
            function (key,value)    // 0/1 digital pin is output with value 0/1     10/11 digital pin is input with value 0/1
            {
                var labStr = "D"+j.toString();
                
                if (value.dataval==10 || value.dataval==11) // input - add slider on page
                {
                    if (value.dataval==10)  {$('#readdigital_vals').append('<div class="boxouter">'+labStr+':<div class="boxstate">Low</div></div>');}
                    else                    {$('#readdigital_vals').append('<div class="boxouter">'+labStr+':<div class="boxstate">High</div></div>');}
                    
                }
                
                j++;
            });
            
            $('#readdigital_vals').append('<br><br>');
            $('#loadingall').hide();
        }); // getJSON

    }

    // reload values when the manual refresh button is clicked
    $('#refresh_dinp4').click(function() {initpage4(0); });
    
    // when going back to the main menu ensure that auto-refresh is disabled
    $('#backfromp4').click(function() {
        if (isAutoRefreshP4)
        {
            isAutoRefreshP4=false;
            $('#autorefresh_dinp4').html("Auto-refresh is OFF");
            $('#refresh_dinp4').show();
            clearInterval(timerP4);
        }
    });
    
    // when auto-refresh button clicked add an interval timer to automatically
    // gather the data.
    // In the function below this is set at every 8 seconds. Do not use too low a value
    // as the Yun takes several seconds to respond to a request.
    // Note, pressing a second time will toggle auto refresh OFF
    $('#autorefresh_dinp4').click(function() {
        if (!isAutoRefreshP4)
        {
            isAutoRefreshP4=true;
            $('#autorefresh_dinp4').html("Auto-refresh is ON");
            $('#refresh_dinp4').hide();
            timerP4=setInterval(function(){
                initpage4(1);
            },8000);
        }
        else
        {
            isAutoRefreshP4=false;
            $('#autorefresh_dinp4').html("Auto-refresh is OFF");
            $('#refresh_dinp4').show();
            clearInterval(timerP4);
        }
    });


// *****************************************************************************    
//                      PAGE 5 FUNCTIONS
// *****************************************************************************    

    // when page 5 selected from the main menu call the function to read the
    // current analog input values and show the results 
    $('#callinitp5').click(function() {initpage5(0);});
    
    
    // function to make a call to the Yun and use the JSON data sent back to display
    // the current analog input values
    function initpage5(option)
    {
        // call with 0 to display div - used for initialisation and manual refresh
        // call with 1 to keep div hidden - used for auto refresh
        $('#loadingall').html('...Loading');
        if (option==0)  $('#loadingall').show();
        
        //$.getJSON("V_io_test.json",function(data){    // swap this for line below to test locally
        $.getJSON("/arduino/in/",function(data){
        $('#readanalogue_vals').empty();    // empty the div
        var j=0;
        $.each(data.Analog,
            function (key,value)    // 0/1 digital pin is output with value 0/1     10/11 digital pin is input with value 0/1
            {
                var labStr = "A"+j.toString();
                {$('#readanalogue_vals').append('<div class="boxouter">'+labStr+':<div class="boxstate">'+value.dataval+'</div></div>');}
                
                j++;
            });
            $('#readanalogue_vals').append('<br><br>');
            $('#loadingall').hide();
        }); // getJSON

    }

    // reload values when the manual refresh button is clicked
    $('#refresh_dinp5').click(function() {initpage5(0); });
    
    
    // when going back to the main menu ensure that auto-refresh is disabled
    $('#backfromp5').click(function() {
        if (isAutoRefreshP5)
        {
            isAutoRefreshP5=false;
            $('#autorefresh_dinp5').html("Auto-refresh is OFF");
            $('#refresh_dinp5').show();
            clearInterval(timerP5);
        }
    });
    
    
    // when auto-refresh button clicked add an interval timer to automatically
    // gather the data.
    // In the function below this is set at every 8 seconds. Do not use too low a value
    // as the Yun takes several seconds to respond to a request.
    // Note, pressing a second time will toggle auto refresh OFF
    $('#autorefresh_dinp5').click(function() {
        if (!isAutoRefreshP5)
        {
            isAutoRefreshP5=true;
            $('#autorefresh_dinp5').html("Auto-refresh is ON");
            $('#refresh_dinp5').hide();
            timerP5=setInterval(function(){
                initpage5(1);
            },8000);
        }
        else
        {
            isAutoRefreshP5=false;
            $('#autorefresh_dinp5').html("Auto-refresh is OFF");
            $('#refresh_dinp5').show();
            clearInterval(timerP5);
        }
    });


});
