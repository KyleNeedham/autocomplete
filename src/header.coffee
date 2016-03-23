((root, factory) ->
  if typeof define is 'function' and define.amd
    define ['underscore', 'jquery', 'backbone', 'backbone.marionette'], (_, $, Backbone, Marionette) ->
    	factory root, {}, _, $, Backbone, Marionette
  else
    root.AutoComplete = factory root, {}, root._, root.jQuery, root.Backbone, root.Backbone.Marionette
) @, (root, AutoComplete, _, $, Backbone, Marionette) ->
