'use strict';

const Clone = require('clone');

const Helper = {
  clone: Clone,
  tree(orgs, parentid, level) {
    const self = this;
    if (!orgs) {
      return [];
    }
    const copy = this.clone(orgs);
    if (parentid == null || parentid == -1) {
      copy.forEach((node, index) => {
        node.title = node.name;
        if (node.parentid > 0) {
          let parent = copy.find(function(data) {
            return data.id == node.parentid;
          });
          if (parent) {
            if (!parent.children) {
              parent.children = [];
            }
            parent.children = Array.from(new Set(parent.children.concat(node)));
            node.moved = true;
          }
        }
      });
      let moved = copy.filter(function(data) {
        return data.moved == true;
      });
      moved.forEach(function(node, index) {
        copy.splice(copy.indexOf(node), 1);
      });
      return copy;
    }
    parentid = parentid > 0 ? parentid : 0;
    level = level > 0 ? level : 0;
    let datas = [];
    copy.forEach((n, k) => {
      let v = Clone(n);
      if (v.parentid == parentid) {
        v.title = v.name;
        v.children = self.tree(orgs, v.id, level + 1);
        if (v.children.length <= 0) {
          delete v.children;
        }
        datas.push(v);
      }
    });
    return datas;
  },
  treeify(orgs, parentid, level, isGroup) {
    let self = this;
    if (!orgs || orgs.length <= 0) {
      return orgs || [];
    }
    const copy = this.clone(orgs);
    if (parentid == null) {
      const trees = self.tree(copy);
      const parentid = trees[0].parentid;
      if (parentid == null) {
        return orgs;
      }
      return self.treeify(orgs, parentid);
    }
    parentid = parentid > 0 ? parentid : 0;
    level = level > 0 ? level : 0;
    isGroup = isGroup || false;
    let datas = [];
    copy.forEach((n, k) => {
      const v = self.clone(n);
      if (v.parentid.toString() == parentid.toString()) {
        v.name = str_repeat('│    ', level) + '├─' + str_repeat('', level) + ' ' + v.name;
        v.isGroup = isGroup;
        if (v.isGroup) {
          v.sub = [];
        }
        datas.push(v);
        if (v.id > 0) {
          let next = self.treeify(orgs, v.id, level + 1, isGroup);
          if (next) {
            datas = datas.concat(next);
          }
        }
      }
    });
    return datas;
  }
};
function str_repeat(input, multiplier) { // eslint-disable-line camelcase
  //  discuss at: http://locutus.io/php/str_repeat/
  // original by: Kevin van Zonneveld (http://kvz.io)
  // improved by: Jonas Raoni Soares Silva (http://www.jsfromhell.com)
  // improved by: Ian Carter (http://euona.com/)
  //   example 1: str_repeat('-=', 10)
  //   returns 1: '-=-=-=-=-=-=-=-=-=-='

  let y = '';
  while (true) {
    if (multiplier & 1) {
      y += input;
    }
    multiplier >>= 1;
    if (multiplier) {
      input += input;
    } else {
      break;
    }
  }
  return y;
}
export default Helper;
