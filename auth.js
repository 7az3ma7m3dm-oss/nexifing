/* ==========================================================================
   NEXIFING — auth.js
   Login / signup / logout + user data + discount logic.
   ========================================================================== */
(function () {
  'use strict';

  if (!window.firebase) {
    console.warn('[auth] Firebase SDK not loaded');
    return;
  }

  var auth = firebase.auth();
  var db   = firebase.firestore();

  var DISCOUNT_TIERS = [
    { min: 3, pct: 0.50, label: '50% off — loyal customer' },
    { min: 1, pct: 0.30, label: '30% off — repeat customer' }
  ];

  function getDiscount(orderCount) {
    orderCount = orderCount || 0;
    for (var i = 0; i < DISCOUNT_TIERS.length; i++) {
      if (orderCount >= DISCOUNT_TIERS[i].min) return DISCOUNT_TIERS[i];
    }
    return { min: 0, pct: 0, label: '' };
  }

  function ensureUserDoc(user) {
    var ref = db.collection('users').doc(user.uid);
    return ref.get().then(function (snap) {
      if (!snap.exists) {
        return ref.set({
          email: user.email || '',
          displayName: user.displayName || '',
          orderCount: 0,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
      }
      return null;
    });
  }

  var Nexifing = window.Nexifing = window.Nexifing || {};

  Nexifing.auth = {
    signup: function (email, password) {
      return auth.createUserWithEmailAndPassword(email, password).then(function (cred) {
        return ensureUserDoc(cred.user).then(function () { return cred.user; });
      });
    },

    login: function (email, password) {
      return auth.signInWithEmailAndPassword(email, password).then(function (cred) {
        return ensureUserDoc(cred.user).then(function () { return cred.user; });
      });
    },

    logout: function () {
      return auth.signOut();
    },

    getUser: function () {
      return new Promise(function (resolve) {
        var unsub = auth.onAuthStateChanged(function (user) {
          unsub();
          if (!user) return resolve(null);
          db.collection('users').doc(user.uid).get().then(function (snap) {
            resolve({
              user: { uid: user.uid, email: user.email },
              profile: snap.exists ? snap.data() : { orderCount: 0 }
            });
          });
        });
      });
    },

    onAuth: function (cb) {
      return auth.onAuthStateChanged(function (user) {
        if (!user) return cb(null);
        db.collection('users').doc(user.uid).get().then(function (snap) {
          cb({
            user: { uid: user.uid, email: user.email },
            profile: snap.exists ? snap.data() : { orderCount: 0 }
          });
        });
      });
    },

    getDiscount: getDiscount,

    applyDiscount: function (priceEgp, orderCount) {
      var d = getDiscount(orderCount);
      if (d.pct === 0) return { original: priceEgp, discounted: priceEgp, pct: 0, label: '' };
      var discounted = Math.round(priceEgp * (1 - d.pct));
      return {
        original: priceEgp,
        discounted: discounted,
        pct: d.pct,
        label: d.label
      };
    }
  };

  function updateNav() {
    var nav = document.getElementById('nav');
    if (!nav) return;

    auth.onAuthStateChanged(function (user) {
      nav.querySelectorAll('.nav-auth').forEach(function (el) { el.parentNode.removeChild(el); });

      var cta = nav.querySelector('.nav-cta');
      var wrap = document.createElement('div');
      wrap.className = 'nav-auth';
      wrap.style.display = 'flex';
      wrap.style.alignItems = 'center';
      wrap.style.gap = '12px';

      if (user) {
        wrap.innerHTML =
          '<a href="dashboard.html" style="font-size:13px;font-weight:500;color:var(--text-3)">' +
            (user.email ? user.email.split('@')[0] : 'Account') +
          '</a>' +
          '<button type="button" class="btn btn-ghost btn-sm" id="navLogout" style="padding:8px 16px;font-size:12px">Sign out</button>';

        if (cta && cta.parentNode) cta.parentNode.insertBefore(wrap, cta);
        else nav.appendChild(wrap);

        var lo = document.getElementById('navLogout');
        if (lo) {
          lo.addEventListener('click', function () {
            Nexifing.auth.logout().then(function () {
              window.location.href = 'index.html';
            });
          });
        }
      } else {
        wrap.innerHTML = '<a href="login.html" style="font-size:13px;font-weight:500;color:var(--text-3)">Sign in</a>';
        if (cta && cta.parentNode) cta.parentNode.insertBefore(wrap, cta);
        else nav.appendChild(wrap);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateNav);
  } else {
    updateNav();
  }

})();
