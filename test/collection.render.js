'use strict';

require('mocha');
require('should');
var each = require('async-each');
var assert = require('assert');
var support = require('./support');
var App = support.resolve();
var List = App.List;
var Views = App.Views;
var pages;

describe('collection.render', function() {
  describe('rendering', function() {
    beforeEach(function() {
      pages = new Views();
      pages.engine('tmpl', require('engine-base'));
    });

    it('should throw an error when no callback is given:', function() {
      (function() {
        pages.render({});
      }).should.throw('Views#render is async and expects a callback function');
    });

    it('should throw an error when an engine is not defined:', function(cb) {
      pages.addView('foo.bar', {content: '<%= name %>'});
      var page = pages.getView('foo.bar');

      pages.render(page, function(err) {
        assert.equal(err.message, 'Views#render cannot find an engine for: .bar');
        cb();
      });
    });

    it('should use helpers to render a view:', function(cb) {
      var locals = {name: 'Halle'};

      pages.helper('upper', function(str) {
        return str.toUpperCase(str);
      });

      pages.addView('a.tmpl', {content: 'a <%= upper(name) %> b', locals: locals});
      var page = pages.getView('a.tmpl');

      pages.render(page, function(err, res) {
        if (err) return cb(err);

        assert.equal(res.content, 'a HALLE b');
        cb();
      });
    });

    it('should use helpers when rendering a view:', function(cb) {
      var locals = {name: 'Halle'};
      pages.helper('upper', function(str) {
        return str.toUpperCase(str);
      });

      pages.addView('a.tmpl', {content: 'a <%= upper(name) %> b', locals: locals});
      var page = pages.getView('a.tmpl');

      pages.render(page, function(err, res) {
        if (err) return cb(err);
        assert.equal(res.content, 'a HALLE b');
        cb();
      });
    });

    it('should render a template when contents is a buffer:', function(cb) {
      pages.addView('a.tmpl', {content: '<%= a %>', locals: {a: 'b'}});
      var view = pages.getView('a.tmpl');

      pages.render(view, function(err, view) {
        if (err) return cb(err);
        assert.equal(view.contents.toString(), 'b');
        cb();
      });
    });

    it('should render a template when content is a string:', function(cb) {
      pages.addView('a.tmpl', {content: '<%= a %>', locals: {a: 'b'}});
      var view = pages.getView('a.tmpl');

      pages.render(view, function(err, view) {
        if (err) return cb(err);
        assert.equal(view.contents.toString(), 'b');
        cb();
      });
    });

    it('should render a view from its path:', function(cb) {
      pages.addView('a.tmpl', {content: '<%= a %>', locals: {a: 'b'}});

      pages.render('a.tmpl', function(err, view) {
        if (err) return cb(err);
        assert.equal(view.content, 'b');
        cb();
      });
    });

    it('should use a plugin for rendering:', function(cb) {
      pages.engine('tmpl', require('engine-base'));
      pages.option('engine', 'tmpl');

      pages.addViews({
        'a': {content: '<%= title %>', locals: {title: 'aaa'}},
        'b': {content: '<%= title %>', locals: {title: 'bbb'}},
        'c': {content: '<%= title %>', locals: {title: 'ccc'}},
        'd': {content: '<%= title %>', locals: {title: 'ddd'}},
        'e': {content: '<%= title %>', locals: {title: 'eee'}},
        'f': {content: '<%= title %>', locals: {title: 'fff'}},
        'g': {content: '<%= title %>', locals: {title: 'ggg'}},
        'h': {content: '<%= title %>', locals: {title: 'hhh'}},
        'i': {content: '<%= title %>', locals: {title: 'iii'}},
        'j': {content: '<%= title %>', locals: {title: 'jjj'}}
      });

      pages.use(function(collection) {
        collection.option('pager', false);

        collection.renderEach = function(done) {
          var list = new List(collection);

          each(list.items, function(item, next) {
            collection.render(item, next);
          }, done);
        };
      });

      pages.renderEach(function(err, items) {
        if (err) return cb(err);
        assert.equal(items[0].content, 'aaa');
        assert.equal(items[9].content, 'jjj');
        assert.equal(items.length, 10);
        cb();
      });
    });
  });
});
