let axios = require('axios');
let cheerio = require('cheerio');
let fs = require('fs');
let poundForPound = {};

//TODO: This link will likely change because of the ID that is append at the end of it    v
axios.get('https://www.sherdog.com/news/rankings/Sherdogs-PoundforPound-Top-10-Rankings-152793')
  .then((res) => {
    if (res.status == 200) {
      const html = res.data;
      const $ = cheerio.load(html);
      $('h2').each((i, el) => {
        let current = $(el).text();
        let link = $(el).find('a').attr('href');
        let currentArr = current.split('. ');
        if (currentArr[1]) {
          let currentRank = currentArr[0];
          let nameAndRecord = currentArr[1].split(' ');
          let currentName = nameAndRecord[0];
          currentName = currentName.replace(/\n/g, " ");
          let currentRecord = nameAndRecord[1];
          getFighterDetails(link)
            .then((details) => {
              //Make DB insert call
              poundForPound[currentRank] = [currentName, currentRecord, details];
              console.log(poundForPound);
            })
            .catch((err) => console.log(err));
        }
      })
    }
  })
  .catch((err) => console.log(err));


getFighterDetails = (url) => {
  let fighterDetails = {};
  return axios.get(`https://www.sherdog.com${url}`)
    .then((res) => {
      const html = res.data;
      const $ = cheerio.load(html);
      let name = $('.fn').text();
      let nickName = $('.nickname').text();
      let dob = $('.birthday').find('span').text();
      let height = $('.height strong').text();
      let weight = $('.weight strong').text();
      let recordTypesRaw = $('.bio_graph .graph_tag').text();
      let recordTypesArr = recordTypesRaw.split(')');
      let recordTypes = [];
      let nationality = $('.birthplace strong').text();
      for (let i = 0; i < recordTypesArr.length - 1; i++) {
        let split = recordTypesArr[i].split(' ')
        let record = split[0] + ' ' + split[1];
        recordTypes.push(record);
      }
      fighterDetails['name'] = name;
      fighterDetails['nickName'] = nickName;
      fighterDetails['dob'] = dob;
      fighterDetails['height'] = height;
      fighterDetails['weight'] = weight;
      fighterDetails['nationality'] = nationality;
      fighterDetails['recordTypes'] = recordTypes;
      return fighterDetails;
    })
    .catch(err => console.log(err));

}