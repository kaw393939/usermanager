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
			state: 'accounts',
			accountSelected: 0
		},
		
		setState: function (state) {
			this.set({state: state});
		},
		
		getState: function () {
			return this.get('state');
		},
		
		setAccountSelected: function (selected) {
			this.set({accountSelected: selected})
		},
		
		getAccountSelected: function () {
			return this.get('accountSelected');
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
        url: 'json/users.json',
        model: window.Account,
        
        initialize : function(){
            this.fetch({
                update: true
            });
        },
        
        search : function (id) {
        	var _id;
        	
        	this.each(function(model){
        		_id = model.get('uid');
        		if(parseInt(id) == _id){
        			return model;
        		}
        	});
        	return null;
        }
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
				'click .accountView': 'clickAccount',
				'mouseover .accountView': 'mouseOverAccount',
				'mouseout .accountView': 'mouseOutAccount'
            },

            initialize: function () {
                this.controller = this.options.controller;
                
                this.collection.bind('reset', this.render, this);
                this.controller.bind('change:accountSelected', this.openAccount, this);
            },

            render: function () {
            	var collection = this.collection,
            		controller = this.controller,
            		view;
                $(this.el).html(this.template({}));
                collection.each(function(account){
                	view = new window.AccountView({
                		el: $('#accountList'),
                		model: account,
                		controller: controller
                	});
                	view.render();
                });
                $('#sidebar').height($('#app').height() - parseInt($('#sidebar').css('padding-top')) - parseInt($('#sidebar').css('padding-bottom')))
                $('#accountDetails').height($('#accountsBox').height() - 30);
                return this;
            },
            
            clickAccount: function(event){
            	var id = $(event.currentTarget).attr('id');
            	$('#'+this.controller.getAccountSelected()).removeClass('selected');
            	$('#'+id).addClass('selected');
            	this.controller.setAccountSelected(id);
            },
            
            mouseOverAccount: function(event){
            	var id = $(event.currentTarget).attr('id');
            },
            
            mouseOutAccount: function (event){
            	var id = $(event.currentTarget).attr('id');
            },
            
            openAccount: function (){
            	var id = this.controller.getAccountSelected(),
            		account = this.collection.at(id),
            		view = new window.AccountDetailsView({
            			model: account,
            			el: $('#accountDetails'),
            			controller: this.controller
            		});
            		console.log(account)
            	view.render();
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
                $(this.el).append(this.template(this.model.toJSON()));
                return this;
            }
        });

        window.AccountDetailsView = Backbone.View.extend({
            template: Handlebars.compile($('#accountDetails-template').html()),
            roleTemplate: Handlebars.compile($('#accountRole-template').html()),

            initialize: function () {
                this.controller = this.options.controller;
            },

            render: function () {
            	var roles = this.model.get('roles');
                $(this.el).html(this.template(this.model.toJSON()));
                for(var i = 0; i < roles.length; i++){
                	$('.roles').append(this.roleTemplate({role: roles[i].role}));
                	if(i == 0){
                		$('.role').removeClass('indent');
                	}
                }
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

    });

}(jQuery));