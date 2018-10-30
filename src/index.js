const AWS   = require('aws-sdk');
const ec2   = new AWS.EC2();

const config = {
  debug:          false,                                                         // print additional info to logs
  dryRunApiCalls: false,                                                        // if true, changes will not be made to AWS resources
  ec2StateCodes: ["0", "16", "64", "80"]                                        // which instance states are in-scope to this function? 0 = pending, 16 = running, 64 = stopping, 80 = stopped
  
};
//##############################################################################
exports.handler = async (event, context) => {

  try {
    
    let ec2Names = await describeTags('instance', ['Name']);
    
    //let instances = await getEc2Instances(config.ec2StateCodes);
    let volumes = await getEbsVolumes();

    for (const volume of volumes) {

      let tagKey   = 'ec2Name';
      let tagValue = undefined;
      
      if (volume.State === "attached") {
        if (ec2Names[volume.InstanceId]['Name'] !== undefined) {
          tagValue = ec2Names[volume.InstanceId]['Name'];  
        } else {
          tagValue = volume.InstanceId + ' (no Name tag)';
        }
      } else {
        tagValue = "volume not attached to EC2";
      }
      
      await addTagToResource(volume.VolumeId, tagKey, tagValue);
      console.log(`Tagged ${volume.VolumeId} with Ec2Name tag = ${tagValue}`);               
    }
  }
  catch (err) {
    console.log("ERROR: " + err);
  }
};

//##############################################################################
async function addTagToResource(volumeId, key, value) {
  
  //volumeId = string containing ebs volume ID (e.g. "vol-024d027dc4a4cfc68");
  
  let params = { 
      Resources: [volumeId], 
      Tags: [
        {
          Key: key,
          Value: value
        }
      ]
  };
  
  debugMessage(`Calling ec2.createTags(${JSON.stringify(params)})`);
  let response = await ec2.createTags(params).promise();
  debugMessage(`ec2.createTags() response: ${JSON.stringify(response,null,2)}`);
  
  return;
}


//##############################################################################
async function describeTags(resourceType, tagKeys) {
  
  /* resourceType should be string containing one of the following values:
        ( customer-gateway | dhcp-options | elastic-ip | fleet | fpga-image | 
          image | instance | internet-gateway | launch-template | natgateway | 
          network-acl | network-interface | reserved-instances | route-table | 
          security-group | snapshot | spot-instances-request | subnet | volume |
          vpc | vpc-peering-connection | vpn-connection | vpn-gateway)
          
  // tagKeys      = array of tag key[s] to return.
  */
  
  if (tagKeys === undefined) {
    tagKeys = ['*'];                                                            // if no tagKey specified, return all keys
  }
  
  let params = {
    Filters: [
      {
        Name: 'resource-type',
        Values: [resourceType]
      },
      {
        Name: 'key',
        Values: tagKeys
      }
    ],
  };
  
  
  let  responses = {};  
  
  do {
    
    debugMessage(`Calling ec2.describeTags(${JSON.stringify(params)})`);
    let response = await ec2.describeTags(params).promise();
    debugMessage(`ec2.describeTags() response:\n${JSON.stringify(response,null,2)}`);
    
    for (const tag of response.Tags) {
      
      if (responses[tag.ResourceId] === undefined) {                            // if encountering a resourceId for the first time, add it to our responses object
        responses[tag.ResourceId] = {};
      }
      
      responses[tag.ResourceId][tag.Key] = tag.Value;
    }
    
  } while (params.NextToken !== undefined);
  
  debugMessage(`Resulting tags object returned by describeTags():\n${JSON.stringify(responses)}`);
  
  return responses;
  
}

//##############################################################################
function debugMessage(message) {
  if (config.debug) {
    console.log(message);
  }
}

//##############################################################################
async function getEbsVolumes() {
  
  let volumeAttachments = [];
  
  let params = {};
  
  do {
    
    debugMessage(`Calling ec2.describeVolumes(${JSON.stringify(params)})`);
    let response   = await ec2.describeVolumes(params).promise();
    debugMessage(`ec2.describeVolumes() response:\n${JSON.stringify(response,null,2)}`);
    
    for (const volume of response.Volumes) {
      for (const attachment of volume.Attachments) {
        volumeAttachments.push(attachment);
      }
    }

    params.NextToken = response.NextToken || undefined;

  } while (params.NextToken !== undefined);
  
  return volumeAttachments;
  
}