
const nh = new pylon.KVNamespace('simple');
const commandsNew = new discord.command.CommandGroup({
  defaultPrefix: '!'
});
discord.on('MESSAGE_REACTION_ADD', async (data) => {
  const channel = await discord.getTextChannel(data.channelId);
  const message = await channel?.getMessage(data.messageId);
  var msg = message['content'];
  let max_page, pageInfo;
  try {
    // get page notif id
    const notifID = await nh.get<string>(message.id);
    // get page info
    max_page = await nh.get<string>(notifID);
    //get page info message
    pageInfo = await channel?.getMessage(notifID);
  } catch (_) {
    //console.log(er);
  }
  //
  if (msg.toLocaleLowerCase().includes('https://i.nhentai.net/galleries/')) {
    //
    let msg_temp = msg.replace('https://i.nhentai.net/galleries/', '');
    msg_temp = msg_temp.replace('.jpg', '');
    msg_temp = msg_temp.replace('.png', '');
    let msg_arr = msg_temp.split('/');
    let curr = msg_arr[1]; // get current page
    //
    switch (data['emoji']['name']) {
      case '🔢':
        let alert = await message.reply('input number');
        discord.on('MESSAGE_CREATE', async (resp) => {
          while (resp.channelId == message.channelId) {
            let num = resp.content - '0';
            if (num < 0) {  // if page request less than zero
              curr = 1;
              await message.deleteReaction('🔢', data['userId']);
              msg = msg.replace(msg_arr[1] + '.', curr + '.');
              await message?.edit(msg);
              pageInfo.edit(`showing 1/${max_page} page`);
            } else if (num > max_page) { // if page request more than max page 
              curr = max_page;
              await message.deleteReaction('🔢', data['userId']);
              msg = msg.replace(msg_arr[1] + '.', curr + '.');
              await message?.edit(msg);
              pageInfo.edit(`maximum page reached! (${max_page})`);
            } else if (Number.isInteger(num)) { // if page request valid
              curr = resp.content;
              await message.deleteReaction('🔢', data['userId']);
              msg = msg.replace(msg_arr[1] + '.', curr + '.');
              await message?.edit(msg);
              pageInfo.edit(`showing ${curr}/${max_page} page`);
            } else { // if page request isnt valid
              await message.deleteReaction('🔢', data['userId']);
              await message.reply('invalid input!!');
            }
            await alert.delete();
          }
        }); 
        break;
      case '▶️':
        curr = curr - '0' + 1;
        if (curr <= max_page) {
          await message.deleteReaction('▶️', data['userId']);
          msg = msg.replace(msg_arr[1] + '.', curr + '.');
          await message?.edit(msg);
          pageInfo.edit(`showing ${curr}/${max_page} page`);
        } else {
          curr = max_page;
          await message.deleteReaction('▶️', data['userId']);
          msg = msg.replace(msg_arr[1] + '.', curr + '.');
          await message?.edit(msg);
          pageInfo.edit(`maximum page reached! (${max_page})`);
        }
        break;
      case '◀️':
        curr = curr - '0' - 1;
        if (curr - '0' > 0) {
          await message.deleteReaction('◀️', data['userId']);
          msg = msg.replace(msg_arr[1] + '.', curr + '.');
          await message?.edit(msg);
          pageInfo.edit(`showing ${curr}/${max_page} page`);
        } else {
          curr = 1;
          await message.deleteReaction('◀️', data['userId']);
          msg = msg.replace(msg_arr[1] + '.', curr + '.');
          await message?.edit(msg);
          pageInfo.edit('minimum page reached!');
        }
        break;
      case '⏩':
        curr = curr - '0' + 5;
        if (curr <= max_page) {
          await message.deleteReaction('⏩', data['userId']);
          msg = msg.replace(msg_arr[1] + '.', curr + '.');
          await message?.edit(msg);
          pageInfo.edit(`showing ${curr}/${max_page} page`);
        } else {
          curr = max_page;
          await message.deleteReaction('⏩', data['userId']);
          msg = msg.replace(msg_arr[1] + '.', curr + '.');
          await message?.edit(msg);
          pageInfo.edit(`maximum page reached! (${max_page})`);
        }
        break;
      case '⏪':
        curr = curr - '0' - 5;
        if (curr - '0' > 0) {
          await message.deleteReaction('⏪', data['userId']);
          msg = msg.replace(msg_arr[1] + '.', curr + '.');
          await message?.edit(msg);
          pageInfo.edit(`showing ${curr}/${max_page} page`);
        } else {
          curr = 1;
          await message.deleteReaction('⏪', data['userId']);
          msg = msg.replace(msg_arr[1] + '.', curr + '.');
          await message?.edit(msg);
          pageInfo.edit('minimum page reached!');
        }
        break;
    }
    // pageInfo.edit(pageMsg);
  }
});

commandsNew.on(
  'nh',
  (args) => ({
    input: args.string(),
    secondInput: args.stringOptional(),
    thirdInput: args.integerOptional()
  }),
  async (message, { input, secondInput, thirdInput }) => {
    const id = message.channelId;
    const ch = await message.getChannel();
    //--------------------------------------------------------------------------------------------- random
    if (ch.nsfw) {
      if (input == 'random') {
        const code = Math.floor(Math.random() * (340000 - 100000 + 1) + 100000);
        await message.reply('https://nhentai.net/g/' + code);
      } else if (input === 'popular') {
        await message.reply('Fetching data... Please Wait.');
        const req = await fetch(
          'https://nhentai-pages-api.herokuapp.com/popular'
        );
        const data = await req.json();
        for (var i = 0; i < 5; i++) {
          await message.reply(
            'https://nhentai.net/g/' + data['results'][i]['bookId']
          );
        }
        //--------------------------------------------------------------------------------------------- detail
      } else if (input === 'detail') {
        await message.reply('Fetching data... Please Wait.');
        let temp;
        if (secondInput === 'random') {
          temp = Math.floor(Math.random() * (340000 - 100000 + 1) + 100000);
        } else {
          temp = secondInput;
        }
        const req = await fetch(
          'https://nhentai-pages-api.herokuapp.com/' + temp
        );
        const data = await req.json();
        if (data['status']) {
          await message.reply('invalid input!');
          return;
        }
        var parodies = '',
          chara = '',
          tags = '',
          languages = '';
        if (data['details']['parodies']) {
          for (var i in data['details']['parodies']) {
            parodies = parodies + data['details']['parodies'][i] + ', ';
          }
        } else {
          parodies = '-';
        }
        if (data['details']['characters']) {
          for (var i in data['details']['characters']) {
            chara = chara + data['details']['characters'][i] + ', ';
          }
        } else {
          chara = '-';
        }
        if (data['details']['tags']) {
          for (var i in data['details']['tags']) {
            tags = tags + data['details']['tags'][i] + ', ';
          }
        } else {
          tags = '-';
        }
        if (data['details']['parodies']) {
          for (var i in data['details']['languages']) {
            languages = languages + data['details']['languages'][i] + ', ';
          }
        } else {
          languages = '-';
        }
        if (data['details']['artists'])
          var artist = data['details']['artists'][0];
        else if (data['details']['groups'])
          var artist = data['details']['groups'][0];
        else var artist = '-';
        await message.reply(
          new discord.Embed({
            color: 0x0099ff,
            title: data['title'],
            image: {
              url: data['thumbnails'][0]
            },
            description: 'Pages: ' + data['details']['pages'][0],
            fields: [
              {
                name: 'link',
                value: 'https://nhentai.net/g/' + temp
              },
              {
                name: 'parodies',
                value: parodies
              },
              {
                name: 'characters',
                value: chara
              },
              {
                name: 'tags',
                value: tags
              },
              {
                name: 'Artist',
                value: artist
              },
              {
                name: 'Language',
                value: languages
              }
            ]
          })
        );
        //--------------------------------------------------------------------------------------------- all
      } else if (input === 'all') {
        await message.reply('Loading... Please Wait.');
        let temp = secondInput;
        const req = await fetch(
          'https://nhentai-pages-api.herokuapp.com/' + temp
        ); // nh get pict API
        const data = await req.json();
        if (data['status']) {
          await message.reply('invalid input!');
          return;
        }
        await message.reply('ada ' + data['details']['pages'][0] + ' Halaman');
        if (data['details']['pages'][0] <= 50) {
          await message.reply(
            'printing ' + data['details']['pages'][0] + ' Halaman...'
          );
          for (var i in data['pages']) {
            await message.reply(data['pages'][i]);
          }
        } else {
          await message.reply(
            'kebanyakan halaman woi, lu kata ni bot punya bokap lu'
          );
          await message.reply('maksimal 50 halaman...');
        }
        //--------------------------------------------------------------------------------------------- page
      } else if (input === 'page') {
        await message.reply('Loading... Please Wait.');
        let temp = thirdInput;
        const req = await fetch(
          'https://nhentai-pages-api.herokuapp.com/' + temp
        ); // nh get pict API
        const data = await req.json();
        let msg = await message.reply(data['pages'][secondInput - 1]);
        //--------------------------------------------------------------------------------------------- read
      } else if (input === 'read') {
        let mes = await message.reply('Loading... Please Wait.');
        let temp = secondInput;
        const req = await fetch(
          'https://nhentai-pages-api.herokuapp.com/' + temp
        ); // nh get pict API
        const data = await req.json();
        let notif = await message.reply(
          `showing 1/${data['details']['pages']} page`
        );
        let msg = await message.reply(data['pages'][0]);
        mes.delete();
        // console.log(msg.id);
        await msg?.addReaction('⏪');
        await msg?.addReaction('◀️');
        await msg?.addReaction('🔢');
        await msg?.addReaction('▶️');
        await msg?.addReaction('⏩');
        //console.log(notif.id);
        await nh.put(msg.id, notif.id);
        // save code id and current page to change later
        //get max page
        await nh.put(notif.id, data['details']['pages']);
        //--------------------------------------------------------------------------------------------- show
      } else if (input === 'show') {
        await message.reply('Loading... Please Wait.');
        let temp = thirdInput;
        const req = await fetch(
          'https://nhentai-pages-api.herokuapp.com/' + temp
        ); // nh get pict API
        const data = await req.json();
        var pages = secondInput.split('-');
        let i = pages[0] - '0';
        while (i <= pages[1] - '0') {
          await message.reply(data['pages'][i - 1]);
          i++;
        }
        //--------------------------------------------------------------------------------------------- if salah command
      } else {
        message.reply('***salah command anjg***');
        const embed = new discord.Embed();
        embed.setTitle('How to Use This Command').setColor(0x00ff00);
        embed.setDescription('<!nh><command> (tags/random)');
        embed.setTimestamp(new Date().toISOString());
        await message.reply({ content: '', embed: embed });
      }
      //---------------------------------------------------------------------------------------------
    } else {
      // insults you to not post command in nsf channel
      await message.reply('ini bukan channel NSFW tolol!!'); 
    }
  }
);
