/* IELTS 备考中心 · 学员登录守门脚本
   账号与密码哈希由此文件校验；页面在 </head> 前引用本脚本。
   data-guard="0" 时不拦截（登录页用）。 */
(function () {
  var SALT = "IELTS::v1::2026";
  var TTL  = 30 * 86400000;
  var KEY  = "ielts_session_v1";
  var ACC  = {"stu01":"1b4f94947515306c8dede42d71df5f683b4fe6312c35ad63139fd2c8da2072f2","stu02":"3382917c8baa5268626d9820870f9e322c81cc3086c024536b50c82a7bf4897b","stu03":"7d18ec839a01d21da91e5144dd26462e88504f0064c02aacd8eba2a91c0bf513","stu04":"998b8bdd2f7ac7ecd4cd542344d9df350bf7eb936242b4c75060774ac6c8f261","stu05":"e9f479b523d94e7dad5e9d613e655f440ae75845e43cd1a87eddde681a13a8e8","stu06":"aea6f4e51f0da5aa966270f0d153ad21f61142ed9e8237e6f85c75354075d503","stu07":"f5b2244df14457c19a0126d36cea6a7338d82296a1a8eb3e56c15cbf3fcd55f8","stu08":"04fb132f4593537c6b56682b6cc22646a81ef4df77b5692bbc4561fc5d4f5412","stu09":"83ce796d804ee31c1d437444a75540fc4ba58b8be11dc5f95fb1586ba9d33012","stu10":"570c002c1b6c780b782343494c0cec0457a2cc2837b0048794bfd5ec1c16bbbf","stu11":"a326c3a9f61c68dc226ef2055874ee6a9e4bb716b16d62e6da697c52031530bb","stu12":"324e7a6649ee5bc6c1b259fabb002f19af2f0586e834569b6edaecbf6d0cf587","stu13":"f303bca53318a0e61e504d347e712a1bb809d9d2f5feaaabfe9f740113b7bd7f","stu14":"c1a1754800551daca5c1babf8f048e7524b9368cdf2f95dcf489d5ed4d819b70","stu15":"b3272515a3cbf724ee851d42356cc03bd024b2e70502cb890c50edd1bdebea7e","stu16":"6d7ccd5d8458d4113834ef0de035b739d7654975b3131499811f132a193afbbc","stu17":"b1b11e017edf0b7fa3480681be4d08b178a12be76b363caba49dc1ca036de5d2","stu18":"c1a9039e6b335313ac45f3c3976aa37cfd3c9a4b9dceaca1a26806a64c2a2eb3","stu19":"0f1d43bdc814a0c3ef928ba69a0f9588f81118f4c053c280d78c2b0c4c67da4e","stu20":"76812c759c607371fa0be202fb80ec65f6b203d7e5854a7bac90f6d4d6bcdde3","stu21":"7d225805ac8d4687bc6b9f7d5fe02cd82642bb71501ae2bbcdbaf52e350b5075","stu22":"42b7759a954c0a6573168303948aafe966da85d1dd082495a41b207b02d68d37","stu23":"81828ce55f292cba9505cf95b9eb33936e0a038a6149838c99f924c4ed68c09f","stu24":"daf78a563fed140354631eeb7b2dc5947d5a4f20f66394631b37dd17f4d30c6a","stu25":"d9020c492a1cacd3647f2861bb12b9bb395df0413acbf3f258d3da6da9c0133b","stu26":"7f4221afef1f99cf935946930a8fb84082337e5769695921de9725af95063235","stu27":"94c3509d3253d96c5672ff27d8a784e5d595285405b4debbfd8c3f9345b57541","stu28":"9da6acc325f1675dac0203a7afd614a97c6eb84dc0df66be7a19cef2d9d56779","stu29":"1214cb40dcb3478ea60b710e51d08a18590a255f9829680bcbb56482bae7542c","stu30":"dbb2d4356f38ae45745bb30f59183d5bc7ddc4cf21e62a331b856f2b8bbfd5cf"};

  var cur = document.currentScript;
  var ROOT = cur ? new URL(".", cur.src).href : "";

  /* ASCII 输入的 SHA-256（不依赖 crypto.subtle，file:// 下也可用） */
  function sha(msg) {
    var K = [0x428a2f98,0x71374491,0xb5c0fbcf,0xe9b5dba5,0x3956c25b,0x59f111f1,0x923f82a4,0xab1c5ed5,
             0xd807aa98,0x12835b01,0x243185be,0x550c7dc3,0x72be5d74,0x80deb1fe,0x9bdc06a7,0xc19bf174,
             0xe49b69c1,0xefbe4786,0x0fc19dc6,0x240ca1cc,0x2de92c6f,0x4a7484aa,0x5cb0a9dc,0x76f988da,
             0x983e5152,0xa831c66d,0xb00327c8,0xbf597fc7,0xc6e00bf3,0xd5a79147,0x06ca6351,0x14292967,
             0x27b70a85,0x2e1b2138,0x4d2c6dfc,0x53380d13,0x650a7354,0x766a0abb,0x81c2c92e,0x92722c85,
             0xa2bfe8a1,0xa81a664b,0xc24b8b70,0xc76c51a3,0xd192e819,0xd6990624,0xf40e3585,0x106aa070,
             0x19a4c116,0x1e376c08,0x2748774c,0x34b0bcb5,0x391c0cb3,0x4ed8aa4a,0x5b9cca4f,0x682e6ff3,
             0x748f82ee,0x78a5636f,0x84c87814,0x8cc70208,0x90befffa,0xa4506ceb,0xbef9a3f7,0xc67178f2];
    var H = [0x6a09e667,0xbb67ae85,0x3c6ef372,0xa54ff53a,0x510e527f,0x9b05688c,0x1f83d9ab,0x5be0cd19];
    var bytes = [];
    for (var i = 0; i < msg.length; i++) {
      var c = msg.charCodeAt(i);
      if (c < 128) bytes.push(c);
      else if (c < 2048) { bytes.push(192 | (c >> 6), 128 | (c & 63)); }
      else { bytes.push(224 | (c >> 12), 128 | ((c >> 6) & 63), 128 | (c & 63)); }
    }
    var bitLen = bytes.length * 8;
    bytes.push(0x80);
    while (bytes.length % 64 !== 56) bytes.push(0);
    for (var i2 = 7; i2 >= 0; i2--) bytes.push((bitLen / Math.pow(2, i2 * 8)) & 255);
    for (var off = 0; off < bytes.length; off += 64) {
      var w = new Array(64), i3;
      for (i3 = 0; i3 < 16; i3++) {
        w[i3] = (bytes[off + i3 * 4] << 24) | (bytes[off + i3 * 4 + 1] << 16) |
                (bytes[off + i3 * 4 + 2] << 8) | bytes[off + i3 * 4 + 3];
      }
      for (i3 = 16; i3 < 64; i3++) {
        var s0 = (w[i3-15] >>> 7 | w[i3-15] << 25) ^ (w[i3-15] >>> 18 | w[i3-15] << 14) ^ (w[i3-15] >>> 3);
        var s1 = (w[i3-2] >>> 17 | w[i3-2] << 15) ^ (w[i3-2] >>> 19 | w[i3-2] << 13) ^ (w[i3-2] >>> 10);
        w[i3] = (w[i3-16] + s0 + w[i3-7] + s1) >>> 0;
      }
      var a = H[0], b = H[1], c2 = H[2], d = H[3], e = H[4], f = H[5], g = H[6], h = H[7];
      for (i3 = 0; i3 < 64; i3++) {
        var S1 = (e >>> 6 | e << 26) ^ (e >>> 11 | e << 21) ^ (e >>> 25 | e << 7);
        var ch = (e & f) ^ (~e & g);
        var t1 = (h + S1 + ch + K[i3] + w[i3]) >>> 0;
        var S0 = (a >>> 2 | a << 30) ^ (a >>> 13 | a << 19) ^ (a >>> 22 | a << 10);
        var maj = (a & b) ^ (a & c2) ^ (b & c2);
        var t2 = (S0 + maj) >>> 0;
        h = g; g = f; f = e; e = (d + t1) >>> 0;
        d = c2; c2 = b; b = a; a = (t1 + t2) >>> 0;
      }
      H[0] = (H[0] + a) >>> 0; H[1] = (H[1] + b) >>> 0;
      H[2] = (H[2] + c2) >>> 0; H[3] = (H[3] + d) >>> 0;
      H[4] = (H[4] + e) >>> 0; H[5] = (H[5] + f) >>> 0;
      H[6] = (H[6] + g) >>> 0; H[7] = (H[7] + h) >>> 0;
    }
    var out = "";
    for (var i4 = 0; i4 < 8; i4++) {
      out += ("00000000" + H[i4].toString(16)).slice(-8);
    }
    return out;
  }

  window.IELTS = { acc: ACC, sha: sha, salt: SALT, key: KEY, ttl: TTL, root: ROOT };

  if (cur && cur.getAttribute("data-guard") === "0") return;

  /* 任意页面加 ?logout=1 即可退出登录 */
  if (/(^|[?&])logout=1?(&|$)/.test(location.search)) {
    try { localStorage.removeItem(KEY); } catch (e) {}
    location.replace(ROOT + "login.html");
    return;
  }

  var ok = false;
  try {
    var raw = localStorage.getItem(KEY);
    if (raw) {
      var o = JSON.parse(raw);
      if (o && o.u && ACC[o.u] && o.k === ACC[o.u] && (Date.now() - o.t) < TTL) ok = true;
    }
  } catch (e) {}

  if (!ok) {
    var next = location.pathname + location.search + location.hash;
    location.replace(ROOT + "login.html?next=" + encodeURIComponent(next));
  }
})();
