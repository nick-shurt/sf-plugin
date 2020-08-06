import { flags, SfdxCommand } from '@salesforce/command';
import { Messages } from '@salesforce/core';
import { AnyJson } from '@salesforce/ts-types';
import * as child from 'child_process';
import * as util from 'util';

// Initialize Messages with the current plugin directory
Messages.importMessagesDirectory(__dirname);

// Load the specific messages for this file. Messages from @salesforce/command, @salesforce/core,
// or any library that is using the messages framework can also be loaded this way.
const messages = Messages.loadMessages('sf-plugin', 'org');
const exec = util.promisify(child.exec);

export default class Test extends SfdxCommand {

  public static description = 'This is a test command';

  public static examples = [
  'sfdx sfplugin:app:test --targetusername target@mytarget.com'
  ];

  //public static args = [{name: 'file'}];

  protected static flagsConfig = {
    // flag with a value (-n, --name=VALUE)
    name: flags.string({char: 'n', description: messages.getMessage('nameFlagDescription')}),
    force: flags.boolean({char: 'f', description: messages.getMessage('forceFlagDescription')})
  };

  // Comment this out if your command does not require an org username
  protected static requiresUsername = true;

  // Comment this out if your command does not support a hub org username
  protected static supportsDevhubUsername = true;

  // Set this to true if your command requires a project workspace; 'requiresProject' is false by default
  protected static requiresProject = false;

  public async run(): Promise<AnyJson> {
    var fs = require('fs'),
    xml2js = require('xml2js');
 
    var parser = new xml2js.Parser();
    fs.readFile('./package/package.xml', function(err, data) {
      parser.parseString(data, function (err, result) {
        result.Package.types.forEach(element => {
          if (element.name == 'ApexClass') {
            element.members.forEach(cls => {
              if ((cls.startsWith('Test') || cls.startsWith('test')) || (cls.endsWith('Test') || cls.endsWith('test'))) {
                fs.appendFile('./testsToRun/testFile.txt', cls + ',', function (err) {
                  if (err) throw err;
                });
                console.log(cls);
              }
            });
          }
        });
      });
    });

    await exec('sfdx force:apex:test:run -u CCM_DEV');

    return null;
  }
}