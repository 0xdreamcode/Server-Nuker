var readlineSync = require('readline-sync');
const Discord = require('discord.js');
const client = new Discord.Client();

var token = 'token';
var home_server = 'id';
var target_id = 'id';

client.on('ready', () => {
  var g = client.guilds.get(target_id)
  var h = client.guilds.get(home_server)

  var check = readlineSync.question(`
!!!Warning!!!

This will nuke the server ${g.name}
  * Every user gets an embed DM server invite.
  * Every user gets banned.

Type "NUKE" to proceed: `);
  if (check != 'NUKE') {
    console.log(`\nNot nuking ${g.name}`)
    process.exit()
  }


  console.log(`\nNuking ${g.name}...`)
  console.log(`${g.memberCount} members.`)
  console.log(`${g.presences.array().length} presences.`)

  h.channels.get(h.systemChannelID).createInvite({
    temporary: false,
    maxAge: 0,
    maxUses: 0
  }).then(inv => {
    var link = `https://discord.gg/${inv.code}`
    var canban = g.members.get(client.user.id).hasPermission(['BAN_MEMBERS'])

    if (!canban)
      console.log('Warning! No ban permission.')

    var processed = 0;
    var i = 0;
    var halt = setInterval(() => {
      if (processed == g.memberCount) {
        clearTimeout(halt)
        console.log('Finished.')
        process.exit()
      }
    }, 100)

    g.members.forEach(async (m) => {
      i++;
      if (!m.hasPermission("ADMINISTRATOR"))
      {
        var emb = new Discord.RichEmbed()
        .setColor('#ff66ff')
        .setTitle(`${g.name} is shutting down!`)
        .setURL(link)
        .setAuthor(`to ${m.user.tag}`, 'http://icons.iconarchive.com/icons/webalys/kameleon.pics/256/Love-Letter-icon.png', link)
        .setDescription(`
          With all due regret we must inform you that the admins of __**${g.name}**__ have decided to shut the server down permanently in favor of a better server.
          `)
        .addField('Invite', `
        Here is your personal invite to the better alternative server, [🔞 __**${h.name}**__ 🔞](${link})! Click to join.
        `)
        .setThumbnail(h.iconURL)
        //.addField('Okay?', ``)
        /*
        .addField('Members', `
        **${h.presences.array().length} online**.
        ${h.memberCount} total.
        `, true) */
        .setImage('https://i.imgur.com/PWsW2pG.png')
        .setTimestamp()
        .setFooter('from the Dark Overlord', 'http://icons.iconarchive.com/icons/webalys/kameleon.pics/256/Love-Letter-icon.png');

        var online = 0;
        var dnd = 0;
        var idle = 0;
        var gaming = 0;
        for (let [snowflake, presence] of h.presences) {
          if (presence.status == 'online') online++;
          if (presence.status == 'dnd') dnd++;
          if (presence.status == 'idle') idle++;
          if (presence.game) gaming++;
        }
        emb = emb.addField('Users', `
        **${h.presences.array().length}** online out of **${h.memberCount}** total.

        ${online} available.
        ${dnd} do not disturb.
        ${idle} idle.
        ${gaming} in-game.
        `, true)
        .addField(`About the new server`, `
            • Always new members.
            • Original content.
            • [Our own website](https://trapan.net).
            • Invite ranks.
          `, true)
          .addField(`Special roles`, `
              If you post pictures of yourself (selfies or lewds) you can get a special role called ***Good Girl*** or ***Good Boy*** depending on your gender preference.
            `, true)
          .addField(`Anything else?`, `
            Come join the server and ask yourself!

            ${link}

            (You will have to wait until a moderator approves you, to make sure you're not a bot)
           `)


        function banUser(id) {
          if (canban) {
            g.ban(id).then(b => {
              console.log(`${i}/${g.memberCount} ${m.user.tag}\tBanned.`);
              processed++;
            }).catch(e => {
              console.log(`${i}/${g.memberCount} ${m.user.tag}\tCould not ban user`)
              processed++;
            })
          }
        }

        m.user.send(emb).then(msg => {
          console.log(`${i}/${g.memberCount} ${m.user.tag}\tMessage delivered.`)
          banUser(m.user.id)
        }).catch(e => {
          console.log(`${i}/${g.memberCount} ${m.user.tag}\tCould not send message`)
          banUser(m.user.id)
        })

      } else {
        console.log(`${i}/${g.memberCount} ${m.user.tag}\tADMIN. Skipping.`)
        processed++;
      }

    })
  })

});

client.login(token);
