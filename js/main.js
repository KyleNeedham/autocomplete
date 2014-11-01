 
var countries,
    triggeredEvents,
    ExampleContainerBasicView,
    EventsView,
    childTemplate,
    ExampleContainerCustomView;

Backbone.ajax = function(request) {
  request.dataType = 'jsonp';
  return $.ajax(request);
};

countries = [{"value":"Afghanistan"},{"value":"Ã…land Islands"},{"value":"Albania"},{"value":"Algeria"},{"value":"American Samoa"},{"value":"Andorra"},{"value":"Angola"},{"value":"Anguilla"},{"value":"Antarctica"},{"value":"Antigua and Barbuda"},{"value":"Argentina"},{"value":"Armenia"},{"value":"Aruba"},{"value":"Australia"},{"value":"Austria"},{"value":"Azerbaijan"},{"value":"Bahamas"},{"value":"Bahrain"},{"value":"Bangladesh"},{"value":"Barbados"},{"value":"Belarus"},{"value":"Belgium"},{"value":"Belize"},{"value":"Benin"},{"value":"Bermuda"},{"value":"Bhutan"},{"value":"Bolivia"},{"value":"Bonaire"},{"value":"Bosnia and Herzegovina"},{"value":"Botswana"},{"value":"Bouvet Island"},{"value":"Brazil"},{"value":"British Indian Ocean Territory"},{"value":"British Virgin Islands"},{"value":"Brunei"},{"value":"Bulgaria"},{"value":"Burkina Faso"},{"value":"Burundi"},{"value":"Cambodia"},{"value":"Cameroon"},{"value":"Canada"},{"value":"Cape Verde"},{"value":"Cayman Islands"},{"value":"Central African Republic"},{"value":"Chad"},{"value":"Chile"},{"value":"China"},{"value":"Christmas Island"},{"value":"Cocos (Keeling) Islands"},{"value":"Colombia"},{"value":"Comoros"},{"value":"Republic of the Congo"},{"value":"Democratic Republic of the Congo"},{"value":"Cook Islands"},{"value":"Costa Rica"},{"value":"Croatia"},{"value":"Cuba"},{"value":"CuraÃ§ao"},{"value":"Cyprus"},{"value":"Czech Republic"},{"value":"Denmark"},{"value":"Djibouti"},{"value":"Dominica"},{"value":"Dominican Republic"},{"value":"Ecuador"},{"value":"Egypt"},{"value":"El Salvador"},{"value":"Equatorial Guinea"},{"value":"Eritrea"},{"value":"Estonia"},{"value":"Ethiopia"},{"value":"Falkland Islands"},{"value":"Faroe Islands"},{"value":"Fiji"},{"value":"Finland"},{"value":"France"},{"value":"French Guiana"},{"value":"French Polynesia"},{"value":"French Southern and Antarctic Lands"},{"value":"Gabon"},{"value":"Gambia"},{"value":"Georgia"},{"value":"Germany"},{"value":"Ghana"},{"value":"Gibraltar"},{"value":"Greece"},{"value":"Greenland"},{"value":"Grenada"},{"value":"Guadeloupe"},{"value":"Guam"},{"value":"Guatemala"},{"value":"Guernsey"},{"value":"Guinea"},{"value":"Guinea-Bissau"},{"value":"Guyana"},{"value":"Haiti"},{"value":"Heard Island and McDonald Islands"},{"value":"Vatican City"},{"value":"Honduras"},{"value":"Hong Kong"},{"value":"Hungary"},{"value":"Iceland"},{"value":"India"},{"value":"Indonesia"},{"value":"Ivory Coast"},{"value":"Iran"},{"value":"Iraq"},{"value":"Ireland"},{"value":"Isle of Man"},{"value":"Israel"},{"value":"Italy"},{"value":"Jamaica"},{"value":"Japan"},{"value":"Jersey"},{"value":"Jordan"},{"value":"Kazakhstan"},{"value":"Kenya"},{"value":"Kiribati"},{"value":"Kuwait"},{"value":"Kyrgyzstan"},{"value":"Laos"},{"value":"Latvia"},{"value":"Lebanon"},{"value":"Lesotho"},{"value":"Liberia"},{"value":"Libya"},{"value":"Liechtenstein"},{"value":"Lithuania"},{"value":"Luxembourg"},{"value":"Macau"},{"value":"Macedonia"},{"value":"Madagascar"},{"value":"Malawi"},{"value":"Malaysia"},{"value":"Maldives"},{"value":"Mali"},{"value":"Malta"},{"value":"Marshall Islands"},{"value":"Martinique"},{"value":"Mauritania"},{"value":"Mauritius"},{"value":"Mayotte"},{"value":"Mexico"},{"value":"Micronesia"},{"value":"Moldova"},{"value":"Monaco"},{"value":"Mongolia"},{"value":"Montenegro"},{"value":"Montserrat"},{"value":"Morocco"},{"value":"Mozambique"},{"value":"Myanmar"},{"value":"Namibia"},{"value":"Nauru"},{"value":"Nepal"},{"value":"Netherlands"},{"value":"New Caledonia"},{"value":"New Zealand"},{"value":"Nicaragua"},{"value":"Niger"},{"value":"Nigeria"},{"value":"Niue"},{"value":"Norfolk Island"},{"value":"North Korea"},{"value":"Northern Mariana Islands"},{"value":"Norway"},{"value":"Oman"},{"value":"Pakistan"},{"value":"Palau"},{"value":"Palestine"},{"value":"Panama"},{"value":"Papua New Guinea"},{"value":"Paraguay"},{"value":"Peru"},{"value":"Philippines"},{"value":"Pitcairn Islands"},{"value":"Poland"},{"value":"Portugal"},{"value":"Puerto Rico"},{"value":"Qatar"},{"value":"Republic of Kosovo"},{"value":"RÃ©union"},{"value":"Romania"},{"value":"Russia"},{"value":"Rwanda"},{"value":"Saint BarthÃ©lemy"},{"value":"Saint Helena"},{"value":"Ascension and Tristan da Cunha"},{"value":"Saint Kitts and Nevis"},{"value":"Saint Lucia"},{"value":"Saint Martin"},{"value":"Saint Pierre and Miquelon"},{"value":"Saint Vincent and the Grenadines"},{"value":"Samoa"},{"value":"San Marino"},{"value":"SÃ£o TomÃ© and PrÃ­ncipe"},{"value":"Saudi Arabia"},{"value":"Senegal"},{"value":"Serbia"},{"value":"Seychelles"},{"value":"Sierra Leone"},{"value":"Singapore"},{"value":"Sint Maarten"},{"value":"Slovakia"},{"value":"Slovenia"},{"value":"Solomon Islands"},{"value":"Somalia"},{"value":"South Africa"},{"value":"South Georgia"},{"value":"South Korea"},{"value":"South Sudan"},{"value":"Spain"},{"value":"Sri Lanka"},{"value":"Sudan"},{"value":"Suriname"},{"value":"Svalbard and Jan Mayen"},{"value":"Swaziland"},{"value":"Sweden"},{"value":"Switzerland"},{"value":"Syria"},{"value":"Taiwan"},{"value":"Tajikistan"},{"value":"Tanzania"},{"value":"Thailand"},{"value":"Timor-Leste"},{"value":"Togo"},{"value":"Tokelau"},{"value":"Tonga"},{"value":"Trinidad and Tobago"},{"value":"Tunisia"},{"value":"Turkey"},{"value":"Turkmenistan"},{"value":"Turks and Caicos Islands"},{"value":"Tuvalu"},{"value":"Uganda"},{"value":"Ukraine"},{"value":"United Arab Emirates"},{"value":"United Kingdom"},{"value":"United States"},{"value":"United States Minor Outlying Islands"},{"value":"United States Virgin Islands"},{"value":"Uruguay"},{"value":"Uzbekistan"},{"value":"Vanuatu"},{"value":"Venezuela"},{"value":"Vietnam"},{"value":"Wallis and Futuna"},{"value":"Western Sahara"},{"value":"Yemen"},{"value":"Zambia"},{"value":"Zimbabwe"}];

triggeredEvents = new (Backbone.Collection.extend({
  add: function(model, options) {
    previous = this.findWhere({name: model.name});

    if (previous) {
      previous.set('count', previous.get('count') + 1);
    } else {
      return Backbone.Collection.prototype.add.apply(this, arguments);
    }
  }
}));

ExampleContainerBasicView = Backbone.Marionette.ItemView.extend({
  el: '#exampleContainerBasic',

  template: '#example',

  ui: {
    autocomplete: 'input'
  },

  behaviors: {
    AutoComplete: {
      behaviorClass: AutoComplete.Behavior,
      collection: {
        options: {
          type: 'dataset',
          data: countries
        }
      }
    }
  },

  initialize: function(options) {
    this.listenTo(this, 'all', this.pushEvents);
  },

  pushEvents: function(name) {
    this.options.triggeredEvents.add({
      count: 1,
      index: this.options.triggeredEvents.length + 1,
      name: name
    });
  }
});

EventsView = Backbone.Marionette.CompositeView.extend({
  el: '#eventLog',
  
  template: '#events',

  childViewContainer: 'tbody',

  childView: Backbone.Marionette.ItemView.extend({
    tagName: 'tr',
    className: 'event-item',
    template: '#eventItem',

    modelEvents: {
      'change:count': 'render'
    }
  })
});

ExampleContainerCustomView = Backbone.Marionette.ItemView.extend({
  el: '#exampleContainerCustom',

  template: '#exampleCustom',

  ui: {
    autocomplete: 'input'
  },

  behaviors: {
    AutoComplete: {
      behaviorClass: AutoComplete.Behavior,
      rateLimit: 200,
      collection: {
        options: {
          type: 'remote',
          remote: 'http://api.rottentomatoes.com/api/public/v1.0/movies.json',
          valueKey: 'title',
          parseKey: 'movies',
          keys: {
            apiKey: 'apiKey',
            query: 'q',
            limit: 'page_limit'
          },
          values: {
            apiKey: 'wfppj2bnmxkfhrvts3a2nuuk',
            limit: 3
          }
        }
      },
      childView: {
        definition: AutoComplete.ChildView.extend({
          template: '#cutsomChild'
        })
      }
    }
  }
});

(new ExampleContainerBasicView({triggeredEvents: triggeredEvents})).render();
(new EventsView({collection: triggeredEvents})).render();
(new ExampleContainerCustomView()).render();

$('body').addClass('in');
