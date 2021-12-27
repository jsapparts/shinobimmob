'use strict';
require("colors");
var fa = require("ws").Server,
    f = require("fs"),
    g = "localhost",
    k = 443,
    l = "My Multiplayer Signalling Server",
    m = "MyCompany",
    n = "Welcome to the MyCompany Multiplayer Signalling server!",
    r = "stun:stun.l.google.com:19302 stun:stun1.l.google.com:19302 stun:stun2.l.google.com:19302 stun:stun3.l.google.com:19302 stun:stun4.l.google.com:19302 stun:23.21.150.121".split(" "),
    t = 1E5,
    u = 1E4,
    v = 200,
    w = 25E3,
    x = 12E5,
    y = 2E4,
    z = 5,
    A = 4,
    B = 30,
    C = 100,
    D = 0,
    E = !0,
    F = "ssl.key",
    G = "ssl.pem";
console.log("*****************************************************".green);
console.log("Construct 2 multiplayer signalling server v1.0".green);
console.log("*****************************************************".green);
if (f.existsSync("config.js")) {
    var H;
    try {
        (H = require("./config")) ? (g = H.server_host || g, E = H.hasOwnProperty("ssl") ? H.ssl : E, F = H.ssl_key || F, G = H.ssl_cert || G, k = H.hasOwnProperty("server_port") ? H.server_port : E ? 443 : 80, l = H.server_name || l, m = H.server_operator || m, n = H.server_motd || n, r = H.ice_servers || r, t = H.hasOwnProperty("max_clients") ? H.max_clients : t, u = H.hasOwnProperty("ping_frequency") ? H.ping_frequency : u, w = H.hasOwnProperty("client_timeout") ? H.client_timeout : w, x = H.hasOwnProperty("inactive_timeout") ? H.inactive_timeout :
            x, y = H.hasOwnProperty("confirm_timeout") ? H.confirm_timeout : y, z = H.hasOwnProperty("host_max_unconfirmed") ? H.host_max_unconfirmed : z, v = H.hasOwnProperty("flood_limit") ? H.flood_limit : v, A = H.hasOwnProperty("client_id_digits") ? H.client_id_digits : A, B = H.hasOwnProperty("max_alias_length") ? H.max_alias_length : B, C = H.hasOwnProperty("max_name_length") ? H.max_name_length : C, D = H.hasOwnProperty("max_game_peers") ? H.max_game_peers : D, console.log("Loaded settings from config.js")) : console.log("No content found in config.js. Reverting to server default settings.".yellow)
    } catch (ja) {
        console.log("Error loading config.js. Reverting to server default settings.".yellow)
    }
} else console.log("Unable to locate config.js. Reverting to server default settings.".yellow);
E && (f.existsSync(F) ? f.existsSync(G) || (console.log(("Unable to find SSL certificate file '" + G + "'. Reverting to insecure server.").yellow), E = !1, 443 === k && (k = 80)) : (console.log(("Unable to find SSL key file '" + F + "'. Reverting to insecure server.").yellow), E = !1, 443 === k && (k = 80)));
var M = process.argv.splice(2);
1 <= M.length && (g = M[0]);
2 <= M.length && (k = parseInt(M[1], 10));
console.log("Server name: " + l);
console.log("Operated by: " + m);
console.log("Starting signalling server on " + (E ? "wss://" : "ws://") + g + ":" + k + "...");
var ka = E ? require("https") : require("http");

function la(a, d) {
    d.writeHead(200, {
        "Content-Type": "text/html"
    });
    d.end("<h2>" + l + "</h2><p>" + n + "</p>\n")
}
var N = null;
E ? (console.log("Starting secure server".cyan), N = ka.createServer({
    key: f.readFileSync(F),
    cert: f.readFileSync(G)
}, la).listen(k, g)) : N = ka.createServer(la).listen(k, g);
var ma = new fa({
    server: N,
    verifyClient: function(a, d) {
        if (O.length <= t) {
            var b = a.req.headers["sec-websocket-protocol"];
            d(b && -1 < b.indexOf("c2multiplayer"))
        } else console.log(("Warning: rejected client; server full (got " + O.length + " clients)").yellow), d(!1)
    }
});
console.log("Server running");
setInterval(na, 1E3);
var P = [];

function na() {
    var a, d, b, e = Date.now();
    a = P;
    d = O;
    a.length = d.length;
    var c;
    b = 0;
    for (c = d.length; b < c; b++) a[b] = d[b];
    a = 0;
    for (d = P.length; a < d; ++a) b = P[a], oa(b, e) || b.remove("timeout");
    P.length = 0
}
var pa = 0,
    Q = 0;
ma.on("connection", qa);

function qa(a) {
    a.on("message", function(d) {
        var c = a.c2_client;
        if (!c.s)
            if (c.A++, c.A >= v) console.log(("Flood limit exceeded for '" + c.b + "' (" + c.id + "), kicked").red), R(c, "flood limit exceeded"), c.remove("flood limit exceeded");
            else {
                var b;
                try {
                    switch (b = JSON.parse(d), b.message) {
                        case "login":
                            c.k = Date.now();
                            c.e = Date.now();
                            if (c.i) R(c, "already logged in");
                            else if (1 > b.protocolrev || 1 < b.protocolrev) R(c, "protocol revision not supported"), c.remove();
                            else if (b.alias) {
                                b.alias.length > B && (b.alias = b.alias.substr(0, B));
                                var h;
                                var aa = b.alias;
                                if (ua(aa)) {
                                    b = 2;
                                    var ba;
                                    do ba = aa + b, ++b; while (ua(ba));
                                    h = ba
                                } else h = aa;
                                c.b = h;
                                c.i = !0;
                                c.send({
                                    message: "login-ok",
                                    alias: c.b
                                });
                                console.log("Client ID '" + c.id + "' logged in with alias '" + c.b + "'")
                            } else R(c, "invalid alias");
                            break;
                        case "join":
                            ya(c, b, !1);
                            break;
                        case "auto-join":
                            ya(c, b, !0);
                            break;
                        case "leave":
                            c.k = Date.now();
                            c.e = Date.now();
                            c.i ? c.a ? (S(c.a, c, !1), c.a = null, c.j = !1, c.m = !1, c.send({
                                message: "leave-ok"
                            })) : R(c, "not in a room") : R(c, "not logged in");
                            break;
                        case "icecandidate":
                            c.e = Date.now();
                            if (c.i)
                                if (c.a) {
                                    var ra =
                                        T(c.a, b.toclientid);
                                    ra ? ra.send({
                                        message: "icecandidate",
                                        from: c.id,
                                        icecandidate: b.icecandidate
                                    }) : R(c, "specified client ID not in same room")
                                } else R(c, "not in a room");
                            else R(c, "not logged in");
                            break;
                        case "offer":
                            c.e = Date.now();
                            if (c.i)
                                if (c.a)
                                    if (c.a.host !== c) R(c, "only room host can send offers");
                                    else {
                                        var sa = T(c.a, b.toclientid);
                                        sa ? sa.send({
                                            message: "offer",
                                            from: c.id,
                                            offer: b.offer
                                        }) : R(c, "specified client ID not in same room")
                                    }
                            else R(c, "not in a room");
                            else R(c, "not logged in");
                            break;
                        case "answer":
                            c.e = Date.now();
                            if (c.i)
                                if (c.a)
                                    if (c.a.host === c) R(c, "room host cannot send answers");
                                    else {
                                        var ta = T(c.a, b.toclientid);
                                        ta ? ta.send({
                                            message: "answer",
                                            from: c.id,
                                            answer: b.answer
                                        }) : R(c, "specified client ID not in same room")
                                    }
                            else R(c, "not in a room");
                            else R(c, "not logged in");
                            break;
                        case "confirm-peer":
                            c.e = Date.now();
                            if (c.i)
                                if (c.a)
                                    if (c.a.host !== c) R(c, "must be host to confirm peers");
                                    else {
                                        var ca = T(c.a, b.id);
                                        if (ca) {
                                            ca.j = !0;
                                            ca.m = !1;
                                            c.C++;
                                            pa++;
                                            var p = c.a;
                                            if (!p.r && p.J && za(p) >= p.v) {
                                                p.r = !0;
                                                var q, I, da;
                                                b = [];
                                                q = 0;
                                                for (I = p.c.length; q < I; ++q) da =
                                                    p.c[q], da.j || b.push(da);
                                                q = 0;
                                                for (I = b.length; q < I; ++q) S(p, b[q], !0, "room full")
                                            }
                                        }
                                    }
                            else R(c, "not in a room");
                            else R(c, "not logged in");
                            break;
                        case "list-instances":
                            c.k = Date.now();
                            c.e = Date.now();
                            b.game.length > C && (b.game = b.game.substr(0, C));
                            h = [];
                            var J, va, ea, ga = Aa(b.game, !1);
                            if (ga)
                                for (J = 0, va = ga.g.length; J < va; ++J) ea = ga.g[J], h.push({
                                    name: ea.name,
                                    peercount: ea.t()
                                });
                            c.send({
                                message: "instance-list",
                                list: h
                            });
                            break;
                        case "list-rooms":
                            c.k = Date.now();
                            c.e = Date.now();
                            b.game.length > C && (b.game = b.game.substr(0, C));
                            b.instance.length >
                                C && (b.instance = b.instance.substr(0, C));
                            var ha = b.which;
                            h = [];
                            var K, wa, ia, s, L, xa = Aa(b.game, !1);
                            if (xa && (ia = Ba(xa, b.instance, !1)))
                                for (K = 0, wa = ia.h.length; K < wa; ++K) {
                                    s = ia.h[K];
                                    L = "available";
                                    if (s.r) {
                                        if (L = "locked", "unlocked" === ha || "available" === ha) continue
                                    } else if (U(s) && (L = "full", "available" === ha)) continue;
                                    h.push({
                                        name: s.name,
                                        peercount: za(s),
                                        maxpeercount: s.v,
                                        state: L
                                    })
                                }
                            c.send({
                                message: "room-list",
                                list: h
                            });
                            break;
                        default:
                            R(c, "protocol error"), c.remove("protocol error")
                    }
                } catch (Fa) {
                    console.log(("Removing client '" +
                        c.b + "' due to protocol error (" + Fa + ")").red), c.remove("protocol error")
                }
            }
    });
    a.on("close", function(b, c) {
        var d = a.c2_client;
        d.remove();
        var h = "";
        c ? h = c : d.D && (h = d.D);
        console.log("Client '" + d.b + "' (" + d.id + ") from " + (d.I || "[unknown]").magenta + " disconnected" + (h ? " ('" + h + "')" : "") + "; " + (O.length + " clients total").cyan)
    });
    a.addEventListener("pong", function() {
        var b = a.c2_client;
        b.e = Date.now();
        b.w = !1
    });
    var d = "";
    a._socket && a._socket.remoteAddress && (d = "" + a._socket.remoteAddress);
    var b = new Ca(a);
    d ? b.I = d : d = "[unknown]";
    b.send({
        message: "welcome",
        protocolrev: 1,
        version: "1.0",
        name: l,
        operator: m,
        motd: n,
        clientid: b.id,
        ice_servers: r
    });
    console.log("Client ID '" + b.id + "' connected from " + d.magenta + "; " + (O.length + " clients total").cyan)
}
var O = [],
    V = {};

function ua(a) {
    a = a.toLowerCase();
    var d, b, e;
    d = 0;
    for (b = O.length; d < b; ++d)
        if (e = O[d], e.i && e.b.toLowerCase() === a) return e;
    return null
}

function Ca(a) {
    this.o = a;
    this.o.c2_client = this;
    this.D = this.I = "";
    this.i = !1;
    this.b = "";
    do {
        a = "";
        for (var d = 0, b = A; d < b; ++d) a += "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Math.floor(36 * Math.random()))
    } while (V[a]);
    this.id = a;
    this.a = this.B = this.d = null;
    this.F = 0;
    this.s = this.j = this.m = !1;
    this.H = "";
    this.u = this.C = this.A = 0;
    this.k = Date.now();
    this.e = Date.now();
    this.G = Date.now();
    this.w = !1;
    O.push(this);
    V[this.id] = this
}
Ca.prototype.remove = function(a) {
    if (!this.s) {
        this.s = !0;
        if (this.o) {
            a && (this.D = a);
            try {
                this.o.close(1002, a || "")
            } catch (d) {}
            this.o = null
        }
        this.a && (S(this.a, this, this.m, a), this.a = null);
        a = O.indexOf(this); - 1 < a && O.splice(a, 1);
        V.hasOwnProperty(this.id) && delete V[this.id]
    }
};
Ca.prototype.send = function(a) {
    if (!this.s) {
        a = JSON.stringify(a);
        try {
            this.o.send(a)
        } catch (d) {
            console.log(("Removed client '" + this.b + "' (" + this.id + "), error sending to websocket").yellow), this.remove("websocket send error")
        }
    }
};

function Da(a) {
    if (!a.s) try {
        return a.A = 0, a.o.ping("ping"), a.G = Date.now(), a.w = !0
    } catch (d) {
        return console.log(("Removed client '" + a.b + "' (" + a.id + "), error pinging websocket").yellow), !1
    }
}

function Ea(a) {
    a.a = null;
    a.j = !1;
    a.m = !1;
    a.k = Date.now();
    a.send({
        message: "kicked"
    })
}

function R(a, d) {
    a.send({
        message: "error",
        details: d
    })
}

function ya(a, d, b) {
    a.k = Date.now();
    a.e = Date.now();
    if (a.i)
        if (a.a) R(a, "already in a room");
        else if (d.game && d.instance) {
        d.game.length > C && (d.game = d.game.substr(0, C));
        d.instance.length > C && (d.instance = d.instance.substr(0, C));
        d.room.length > C && (d.room = d.room.substr(0, C));
        var e = !1,
            c = !0;
        a.d = Aa(d.game, !0);
        if (0 < D && a.d.t() >= D) a.d = null, R(a, "game full (beta limit 50 peers per game)");
        else {
            a.B = Ba(a.d, d.instance, !0);
            if (d.room) {
                if (b) {
                    e = a.B;
                    c = d.room;
                    b = d.lock_when_full;
                    for (var $ = 1, h = "", h = null; !h;)
                        if (h = c, 1 < $ && (h += $.toString()),
                            ++$, e.l.hasOwnProperty(h)) {
                            if (h = e.l[h], U(h) || h.r) h = null
                        } else h = new W(e, h, b);
                    a.a = h
                } else if (e = a.B, c = d.room, e = e.l.hasOwnProperty(c) ? e.l[c] : new W(e, c, !1), a.a = e, U(a.a)) {
                    a.a = null;
                    R(a, "room full");
                    return
                }
                a: if (e = a.a, e.r || U(e) || -1 < e.c.indexOf(a)) c = !1;
                    else {
                        if (e.host) {
                            if (e.host.send({
                                    message: "peer-joined",
                                    peerid: a.id,
                                    peeralias: a.b
                                }), !e.host) {
                                console.log(("Client '" + a.b + "' failed to join room; host error sending peer join notification").yellow);
                                c = !1;
                                break a
                            }
                        } else e.host = a;
                        e.c.push(a);
                        e.n[a.id] = a;
                        console.log("Client '" +
                            a.b + "' (" + a.id + ") joined '" + e.f.d.name + "/" + e.f.name + "/" + e.name + "' (" + (e.host === a ? "host" : "peer") + "), " + (e.c.length + " peers").green);
                        c = !0
                    }
                if (c) {
                    if (a.j = !1, a.m = !0, a.F = Date.now(), e = a.a.host === a) a.j = !0, a.m = !1, d.max_clients && (b = d.max_clients, 0 !== b && (2 > b && (b = 2), a.a.v = b))
                } else {
                    a.a = null;
                    R(a, "cannot join room");
                    return
                }
            }
            c ? a.a ? e ? (a.C = 0, a.u = 0, a.send({
                message: "join-ok",
                game: d.game,
                instance: d.instance,
                room: a.a.name,
                host: !0
            })) : a.send({
                message: "join-ok",
                game: d.game,
                instance: d.instance,
                room: a.a.name,
                host: !1,
                hostid: a.a.host.id,
                hostalias: a.a.host.b
            }) : a.send({
                message: "join-ok",
                game: d.game,
                instance: d.instance
            }) : R(a, "cannot join room")
        }
    } else R(a, "invalid game/instance");
    else R(a, "not logged in")
}

function oa(a, d) {
    if (!a.a && d - a.k >= x) return console.log(("Client ID '" + a.b + "' connection idle for " + Math.floor((d - a.k) / 6E4) + " mins, disconnecting").yellow), !1;
    var b, e, c;
    a.a && !a.j && d >= a.F + y && (c = (b = a.a.host) && a.H === b.id, a.H = b ? b.id : "", c ? console.log(("Confirm timeout expired for '" + a.b + "', kicking (counting as retry)").yellow) : (Q++, e = Q + pa, console.log(("Confirm timeout expired for '" + a.b + "', kicking (" + Math.round(1E3 * Q / e) / 10 + "% timeout rate over " + e + " connections)").yellow)), S(a.a, a, !0, "timeout"), Ea(a),
        b && (e = b.a, c || b.u++, 0 === b.C && b.u >= z && (console.log(("Host '" + b.b + "' unable to confirm " + b.u + " peers; kicking as likely unhostable connection").yellow), R(b, "unable to confirm peers, likely unhostable connection"), Ea(b), S(e, b, !1))));
    if (d - a.e < u) return !0;
    if (a.w) {
        if (d - a.e >= w) return console.log(("Client '" + a.b + "' (" + a.id + ") timed out: not responded for " + Math.round((d - a.e) / 100) / 10 + "s").yellow), !1;
        if (d - a.G >= u && !Da(a)) return !1
    } else if (!Da(a)) return !1;
    return !0
}

function Aa(a, d) {
    return X.hasOwnProperty(a) ? X[a] : d ? new Y(a) : null
}
var Ga = [],
    X = {};

function Y(a) {
    this.name = a;
    this.g = [];
    this.p = {};
    Ga.push(this);
    X[this.name] = this
}

function Ba(a, d, b) {
    return a.p.hasOwnProperty(d) ? a.p[d] : b ? new Z(a, d) : null
}
Y.prototype.q = function() {
    return !this.g.length
};
Y.prototype.t = function() {
    var a, d, b = 0;
    a = 0;
    for (d = this.g.length; a < d; ++a) b += this.g[a].t();
    return b
};
Y.prototype.remove = function() {
    for (; this.g.length;) this.g[0].remove();
    var a = Ga.indexOf(this); - 1 < a && Ga.splice(a, 1);
    X.hasOwnProperty(this.name) && delete X[this.name]
};

function Z(a, d) {
    this.d = a;
    this.name = d;
    this.h = [];
    this.l = {};
    this.d.g.push(this);
    this.d.p[this.name] = this
}
Z.prototype.t = function() {
    var a, d, b = 0;
    a = 0;
    for (d = this.h.length; a < d; ++a) b += this.h[a].c.length;
    return b
};
Z.prototype.q = function() {
    return !this.h.length
};
Z.prototype.remove = function() {
    for (; this.h.length;) this.h[0].remove();
    var a = this.d.g.indexOf(this); - 1 < a && this.d.g.splice(a, 1);
    this.d.p.hasOwnProperty(this.name) && delete this.d.p[this.name];
    this.d.q() && this.d.remove()
};

function W(a, d, b) {
    this.f = a;
    this.name = d;
    this.r = !1;
    this.J = b;
    this.host = null;
    this.c = [];
    this.n = {};
    this.v = t;
    this.f.h.push(this);
    this.f.l[this.name] = this
}
W.prototype.remove = function() {
    this.host && (this.host.a = null);
    this.host = null;
    var a, d;
    a = 0;
    for (d = this.c.length; a < d; ++a) Ea(this.c[a]);
    this.c.length = 0;
    this.n = {};
    a = this.f.h.indexOf(this); - 1 < a && this.f.h.splice(a, 1);
    this.f.l.hasOwnProperty(this.name) && delete this.f.l[this.name];
    this.f.q() && this.f.remove()
};
W.prototype.q = function() {
    return !this.c.length
};

function za(a) {
    var d = 0,
        b, e;
    b = 0;
    for (e = a.c.length; b < e; ++b) a.c[b].j && ++d;
    return d
}

function S(a, d, b, e) {
    var c = a.c.indexOf(d); - 1 < c && a.c.splice(c, 1);
    a.n.hasOwnProperty(d.id) && delete a.n[d.id];
    d.a = null;
    console.log("Client '" + d.b + "' (" + d.id + ") left '" + a.f.d.name + "/" + a.f.name + "/" + a.name + "', " + (a.c.length + " peers").green);
    a.host === d ? (console.log("Client was host; closing room (kicking " + a.c.length + " peers)"), a.remove()) : (a.host && b && (b = a.host, b.i && b.a && b.a.host === b && b.send({
        message: "peer-quit",
        id: d.id,
        reason: e || "unknown"
    })), a.q() && a.remove())
}

function T(a, d) {
    return a.n.hasOwnProperty(d) ? a.n[d] : null
}

function U(a) {
    return a.c.length >= a.v
};