#include <Bridge.h>;
#include <YunServer.h>
#include <YunClient.h>

// server 
YunServer server;

// general loop variable
int i;

// pinDirs gives data direction for D2,D3, ... D13
//	0:	output
//	1:	input
//	2:	input with internal pull-up enabled
//
// D13 initialised as output to drive on-board LED
// use internal pull-up with care when making D13 input! 
byte pinDirs[]={1,1,1,1,1,1,1,1,1,1,1,0};

// pinVals gives the input/output values for pins D2,..., D13
byte pinVals[]={0,0,0,0,0,0,0,0,0,0,0,0};

// anVals stores the analog input values for pins A0,..., A5
int  anVals[]={0,0,0,0,0,0};

void setup() {

	// Bridge startup
	pinMode(13,OUTPUT);
	digitalWrite(13, LOW);
	Bridge.begin();
	digitalWrite(13, HIGH);

	// Listen for incoming connection only from localhost
	// (no one from the external network could connect)
	server.listenOnLocalhost();
	server.begin();

	// initialise digital input/output directions
	// set output values, read digital and analog inputs
	setPinDirs();
	setPinVals();
}



void loop() {
	// Get clients coming from server
	YunClient client = server.accept();

	// There is a new client?
	if (client)
	{
		// read the command
		String command;
		command = client.readStringUntil('/');
		command.trim();        //kill whitespace
		//
		// command = io
		// this sets the direction of data for the digital pins
		// see definition of pinDirs[] above
		// returns a JSON "OK" object when finished
		//
		if (command=="io")
		{
			command=client.readStringUntil('/');
			command.trim();

			for (i=0;i<command.length();i++)
			{
				pinDirs[i]=byte(command.charAt(i)-48);
			}

			// set JSON header
			client.println("Status: 200");
			client.println("Content-type: application/json");
			client.println();
			// return ok status
			client.print("{\"ret\":\"ok\"}");

			// update data direcitons
			setPinDirs();
		}


		//
		// command = do
		// this sets values for the digital output pins
		// returns a JSON "OK" object when finished
		//
		if (command=="do")
		{
			command=client.readStringUntil('/');
			command.trim();

			for (i=0;i<command.length();i++)
			{
				if (command.charAt(i)!='-')
				{
					pinVals[i]=byte(command.charAt(i)-48);
				}
				else
				{
					pinVals[i]=255;
				}
			}

			// set JSON header
			client.println("Status: 200");
			client.println("Content-type: application/json");
			client.println();
			// return ok status
			client.print("{\"ret\":\"ok\"}");

			// update data values
			setPinVals();
		}    

		//
		// command = in
		// this reads the digital and analog inputs
		// and returns the values as a JSON object
		//
		if (command=="in")
		{
			// update data values
			setPinVals();

			// set JSON header
			client.println("Status: 200");
			client.println("Content-type: application/json");
			client.println();

			// set JSON data
			//
			// first give the data direction definitions
			client.print("{\"Datadir\" : [");
			for (i=0;i<12;i++)
			{
				client.print("{\"datadir\" : "+String(pinDirs[i])+"}");  
				if (i<11) client.print(",");
			}
			// finish the array
			// then give the digital input values
			client.print("],\"Digital\" : [");
			for (i=0;i<12;i++)
			{
				if(pinDirs[i]==0)
				{
					client.print("{\"dataval\" : "+String(pinVals[i])+"}");
				}
				else
				{
					client.print("{\"dataval\" : "+String(10+pinVals[i])+"}");
				}
				if (i<11) client.print(",");
			}  
			// finish the array
			// then give the analog input values
			client.print("],\"Analog\" : [");
			for (i=0;i<6;i++)
			{
				client.print("{\"dataval\" : "+String(anVals[i])+"}");
				if (i<5) client.print(",");
			}
			client.print("]}");
		}    


		// Close connection and free resources.
		client.stop();
	}

	delay(50); // Poll every 50ms
}

// set the pin modes based on the pinDirs[] array
void setPinDirs()
{
	for(i=0;i<12;i++)
	{
		if (pinDirs[i]==0)  pinMode(2+i, OUTPUT);
		if (pinDirs[i]==1)  pinMode(2+i, INPUT);
		if (pinDirs[i]==2)  pinMode(2+i, INPUT_PULLUP);
	}  
}

// set the output pin values based on the pinVals[] array
// read the digital input values and store in the pinVals[] array
// read the analog input values and store in the anVals[] array
void setPinVals()
{
	for(i=0;i<12;i++)
	{
		if (pinDirs[i]==0 && pinVals[i]==0) digitalWrite(2+i,LOW);
		if (pinDirs[i]==0 && pinVals[i]==1) digitalWrite(2+i,HIGH);    
		if (pinDirs[i]==1 || pinDirs[i]==2)
		{
			if (digitalRead(2+i)==LOW)  pinVals[i]=0;
			if (digitalRead(2+i)==HIGH)  pinVals[i]=1;
		}
	}  

	// read analogue values.
	// The arduno uses a multiplexor for analog in with all inputs using
	// a commons ADC. This means that the multiplexor needs to switch
	// between inputs and time is required for the voltage to stabilise.
	// Multiple reads with a delay can help
	for (i=0;i<6;i++)
	{
		// first read trigger the switch
		anVals[i]=analogRead(i);  
		// delay to let voltage stabilise
		delay(20);
		// Next read gives correct reading with no ghosting from other channels		
		anVals[i]=analogRead(i);  
	}
}