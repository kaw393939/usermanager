/*Bryan Nissen - Bryan@webizly.com*/
/*global window, Backbone, document, Handlebars, jQuery */
(function ($) {
    "use strict";
    /////-----     MODELS     -----/////

    window.Page = Backbone.Model.extend({});

    window.Asset = Backbone.Model.extend({});

    window.Account = Backbone.Model.extend({});

    window.Controller = Backbone.Model.extend({
		defaults: {
			state: 'accounts'
		},
		
		setState: function (state) {
			this.set({state: state});
		},
		
		getState: function () {
			return this.get('state');
		}
    });

    /////-----   COLLECTIONS   -----/////

    window.Pages = Backbone.Collection.extend({
        url: 'json/pages.json',
        model: window.Page
    });

    window.Assets = Backbone.Collection.extend({
        url: 'json/assets.json',
        model: window.Asset
    });

    window.Accounts = Backbone.Collection.extend({
        url: 'json/assets.json',
        model: window.Account
    });

    window.pages = new window.Pages();
    window.assets = new window.Assets();
    window.accounts = new window.Accounts();
    window.controller = new window.Controller();

    $(document).ready(function () {

        /////-----     VIEWS     -----//////

        //View that contains the entire app
        window.AppView = Backbone.View.extend({
            template: Handlebars.compile($('#app-template').html()),

            events: {

            },

            initialize: function () {
                this.controller = this.options.controller;
                this.controller.bind('change:state', this.changePage, this);
            },

            render: function () {
                $(this.el).html(this.template({}));
                this.changePage();
                return this;
            },
            
            changePage: function(){
            	var state = this.controller.getState();
            	console.log('pew pew')
            	if (state == 'accounts'){
            		this.page = new window.AccountsView({
            			el: $('#appPage-inner'),
            			controller: this.controller,
            			collection: window.accounts
            		});
            	}
            	
            	this.page.render();
            }
        });

        /////       Page Views      /////

        window.PagesView = Backbone.View.extend({
            template: Handlebars.compile($('#pagesView-template').html()),

            events: {

            },

            initialize: function () {
                this.controller = this.options.controller;
            },

            render: function () {
                $(this.el).html(this.template({}));
                return this;
            }
        });

        /////       Asset Views     /////

        window.AssetsView = Backbone.View.extend({
            template: Handlebars.compile($('#assetsView-template').html()),

            events: {

            },

            initialize: function () {
                this.controller = this.options.controller;
            },

            render: function () {
                $(this.el).html(this.template({}));
                return this;
            }
        });

        /////       Account Views       /////

        window.AccountsView = Backbone.View.extend({
            template: Handlebars.compile($('#accountsView-template').html()),

            events: {

            },

            initialize: function () {
                this.controller = this.options.controller;
            },

            render: function () {
                $(this.el).html(this.template({}));
                return this;
            }
        });

        window.AccountView = Backbone.View.extend({
            template: Handlebars.compile($('#accountView-template').html()),

            events: {

            },

            initialize: function () {
                this.controller = this.options.controller;
            },

            render: function () {
                $(this.el).html(this.template(this.model.toJSON()));
                return this;
            }
        });

        window.AccountDetailsView = Backbone.View.extend({
            template: Handlebars.compile($('#accountDetails-template').html()),

            initialize: function () {
                this.controller = this.options.controller;
            },

            render: function () {
                $(this.el).html(this.template(this.model.toJSON()));
                return this;
            }
        });

        /////           Services Views          /////

        window.ServicesView = Backbone.View.extend({
            template: Handlebars.compile($('#servicesView-template').html()),

            events: {

            },

            initialize: function () {
                this.controller = this.options.controller;
            },

            render: function () {
                $(this.el).html(this.template({}));
                return this;
            }
        });

        /////       Settings Views      /////

        window.SettingsView = Backbone.View.extend({
            template: Handlebars.compile($('#settingsView-template').html()),

            events: {

            },

            initialize: function () {
                this.controller = this.options.controller;
            },

            render: function () {
                $(this.el).html(this.template({}));
                return this;
            }
        });

    });

    /////-----     ROUTER     -----/////

    window.App = Backbone.Router.extend({

        routes: {
            '': 'accounts',
            'home': 'home',
            'pages': 'pages',
            'assets': 'assets',
            'accounts': 'accounts',
            'services': 'services',
            'settings': 'settings'
        },

        initialize: function () {
        	this.controller = window.controller
			this.appView = new window.AppView({
				el: $('#app'),
				controller: this.controller
			});
			this.appView.render();
        },

        home: function () {

        },

        pages: function () {

        },

        assets: function () {

        },

        accounts: function () {
			this.controller.setState('accounts');
        },

        services: function () {

        },

        settings: function () {

        }
    });

    $(function () {
        window.App = new window.App();
        Backbone.history.start();
    });

}(jQuery));