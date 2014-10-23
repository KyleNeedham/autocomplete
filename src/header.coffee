((root, factory) ->
  if typeof define is 'function' and define.amd
    define ['jquery', 'bootstrap', 'underscore', 'backbone', 'marionette'], factory
  else
    root.AutoComplete = factory root, {}, root.Backbone.$, root._, root.Backbone, root.Backbone.Marionette
) @, (root, AutoComplete, $, _, Backbone, Marionette) ->