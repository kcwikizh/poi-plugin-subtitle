{_, SERVER_HOSTNAME} = window
Promise = require 'bluebird'
async = Promise.coroutine
PLUGIN_VERSION = '0.0.1'
webview = $('kan-game webview')
shipgraph = {}
voiceMap = {}
voiceKey = [2475, 1555, 3347, 8691, 7847, 3595, 1767, 3311, 2507, 9651, 5321, 4473, 7117, 5947, 9489, 2669, 8741, 6149, 1301, 7297, 2975, 6413, 8391, 9705, 2243, 2091, 4231, 3107, 9499, 4205, 6013, 3393, 6401, 6985, 3683, 9447, 3287, 5181, 7587, 9353, 2135, 4947, 5405, 5223, 9457, 5767, 9265, 8191, 3927, 3061, 2805, 3273, 7331]
convertFilename = (shipId, voiceId) ->
  # Kadokawa doesn't provide repair voice any more. We need to use the old.
  return voiceId if voiceId in [6]
  return (shipId + 7) * 17 * voiceKey[voiceId - 1] % 99173 + 100000
voiceMap[convertFilename(275,i)] = i for i in [1..voiceKey.length]
subtitles = 
  1: '长门：我长门，可远不会输给新来的呐。'
  2: '长门：那，那個……姑且還是準備好了的。不，只是陸奧她說，這種東西很重要的。啊，這個給你。怎麼樣……'
  3: '长门：我的脸上有什么东西么？'
  4: '长门：嗯、幹什麼……!? 不……不是……並不是討厭……'

if config.get('plugin.Subtitle.enable', true)
  window.addEventListener 'game.response', (e) ->
    {method, path, body, postBody} = e.detail
    {_ships, _decks, _teitokuLv} = window
    switch path
      when '/kcsapi/api_start2'
        shipgraph[ship.api_id] = ship.api_filename for ship in body.api_mst_shipgraph
        console.log JSON.stringify shipgraph
    return
  webview.addEventListener 'did-get-response-details', (e) ->
    console.log e.newURL
    match = /kcs\/sound\/kc(.*?)\/(.*?).mp3/.exec(e.newURL)
    return if not match? or match.length < 3
    [..., shipCode, fileName] = match
    window.log subtitles[keymap[fileName]] if shipCode == 'szgthkexanxl'
    return
module.exports =
  name: 'Subtitle'
  author: [<a key={0} href="https://github.com/grzhan">grzhan</a>]
  displayName: <span><FontAwesome key={0} name='microphone' /> 语音字幕</span>
  description: '舰娘语音字幕插件'
  show: false
  version: PLUGIN_VERSION
