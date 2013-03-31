/*Bryan Nissen - Bryan@webizly.com*/
/*global window, Backbone, document, Handlebars, jQuery */
(function ($) {
    "use strict";
    /////-----     MODELS     -----/////

    window.Page = Backbone.Model.extend({});

    window.Asset = Backbone.Model.extend({});

    window.Account = Backbone.Model.extend({
    	
    	defaults: {
    		firstName: "",
    		lastName: "",
    		uid: 0,
    		email: "",
    		roles: [],
    		picture: "img/defaultProfilePicture.png",
    		joinDate: "",
    		lastLogin: "",
    		bio: ""
    	}
    });

    window.Controller = Backbone.Model.extend({
		defaults: {
			state: 'accounts',
			accountSelected: 0,
			selectedAccounts: []
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
		},
		
		addAccountToSelection : function (uid){
			var accounts = this.get("selectedAccounts");
			accounts.push(uid);
		},
		
		removeAccountFromSelection : function (uid){
			var accounts = this.get("selectedAccounts"),
				i = accounts.indexOf(uid);
			accounts.splice(i, 1);
		},
		
		isAccountSelected : function (uid) {
			var accounts = this.get("selectedAccounts");
			if(accounts.indexOf(uid) > -1){
				return true;
			}else{
				return false;
			}
		},
		
		getSelectedAccounts : function () {
			return this.get("selectedAccounts");
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
        //url: 'json/users.json',
        model: window.Account,
        localStorage: new Store("Accounts"),

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
        },
        
        deleteAccount: function (uid){
        	var model = this.at(uid),
        		id = model.id, i = 0;
        	console.log(id)
        	localStorage.removeItem('Accounts-'+id);
        	this.remove(model);
        	
        	this.each(function(model){
        		model.save({uid: i});
        		i++;
        	});
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
            			collection: window.accounts,
            			app: this
            		});
            		this.page.render();
            	}
            	//this.adjustSidebar();
            	console.log('ChangePage')
            },
            
            adjustSidebar: function () {
            	var appHeight = $('#app').height(),
            		paddingTop = parseInt($('#sidebar').css('padding-top')),
            		paddingBottom =parseInt($('#sidebar').css('padding-bottom'));
            		
            	$('#sidebar').height(appHeight - paddingTop - paddingBottom);
            	console.log(appHeight - paddingTop - paddingBottom, appHeight)
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
				'mouseout .accountView': 'mouseOutAccount',
				'click #addAccount': 'addAccount',
				'click #deleteAccounts': 'deleteAccounts',
				'click .account-checkbox': 'selectAccount'
            },

            initialize: function () {
                this.controller = this.options.controller;
                this.app = this.options.app;
                
                this.collection.bind('reset', this.render, this);
                this.collection.bind('remove', this.render, this)
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
				this.app.adjustSidebar();
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
            
            addAccount: function () {
            	var account = new window.Account(),
            		uid = this.collection.models.length,
            		date = new Date(),
            		dateString;
            		
       			dateString = (date.getMonth()+1) + "/" + date.getDate() + "/" + date.getFullYear()
       			console.log(dateString) 
            	this.collection.add(account);
            	account.save({uid: uid, joinDate: dateString, lastLogin: dateString}, {
            		success: function () {
            			document.location.href += "#accounts/edit/"+uid;	
            	}});
            	
            },
            
            deleteAccounts : function () {
            	var accounts = this.controller.getSelectedAccounts();
            	
            	for (var i = 0; i < accounts.length; i += 1){
            		this.collection.deleteAccount(accounts[i]);
            	}
            },
            
            selectAccount : function (event){
            	var id = $(event.currentTarget).data('id'),
            		controller = this.controller;
            	
            	if(controller.isAccountSelected(id)){
            		controller.removeAccountFromSelection(id);
            	}else{
            		controller.addAccountToSelection(id);
            	}
            	console.log(controller.getSelectedAccounts(),controller.getSelectedAccounts.length)
            	if(controller.getSelectedAccounts().length >= 1){
            		$('#deleteAccounts').addClass('show');
            	}else{
            		$('#deleteAccounts').removeClass('show');
            	}
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
			
			events:{
				'click #edit' : 'editProfile'
			},
			
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
            },
            
            editProfile: function () {
            	document.location.href += '#accounts/edit/'+this.model.get('uid');
            }
        });
        
        window.EditAccountView = Backbone.View.extend({
        	template: Handlebars.compile($('#editAccount-template').html()),
        	
        	events: {
        		'click #submit': 'submit'
        	},
        	
        	initialize: function () {
        		this.controller = this.options.controller;
        		this.app = this.options.app;
        	},
        	
        	render: function () {
        		$(this.el).html(this.template(this.model.toJSON()));
        		this.app.adjustSidebar();
        		return this;
        	},
        	
        	submit: function () {
        		var fname = $('#firstName').val(),
        			lname = $('#lastName').val(),
        			email = $('#email').val(),
        			bio = $('#bio').val();
        		
        		this.model.set({
        			firstName: fname,
        			lastName: lname,
        			email: email,
        			bio: bio
        		})
        		this.model.save({},{error: function(){ console.log('error')}, 
        		success: function (){
        			document.location.href = "file:///C:/Users/Bryan/Documents/Workspace/UserManager/backbone/index.html";
        		}});
        		
        	}
        })

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
	
	        routes : {
	            '': 'accounts',
	            'home': 'home',
	            'pages': 'pages',
	            'assets': 'assets',
	            'accounts': 'accounts',
	            'accounts/edit/:id' : 'editAccount',
	            'services': 'services',
	            'settings': 'settings'
	        },
	
	        initialize: function () {
	        	
				console.log(this.routes)
	        },
	
	        home: function () {
	
	        },
	
	        pages: function () {
	
	        },
	
	        assets: function () {
	
	        },
	
	        accounts: function () {
	            this.controller = window.controller;
				this.controller.setState('accounts');
				
                this.accounts = window.accounts;
                this.appView = new window.AppView({
                    el: $('#app'),
                    controller: this.controller
                });
                this.appView.render();
	        },
	        
	        editAccount: function (id) {
	            console.log('router function')
	 			this.controller.setState('editAccount');
                this.editAccount = new window.EditAccountView({
                    el: $('#appPage-inner'),
                    model: this.accounts.at(id),
                    controller: this.controller,
                    app: this.appView
                });
                
                this.editAccount.render();
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