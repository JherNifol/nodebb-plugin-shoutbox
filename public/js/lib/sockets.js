(function(Shoutbox) {

	var Messages = {
		getShouts: 'plugins.shoutbox.get',
		sendShout: 'plugins.shoutbox.send',
		removeShout : 'plugins.shoutbox.remove',
		editShout: 'plugins.shoutbox.edit',
		notifyStartTyping: 'plugins.shoutbox.notifyStartTyping',
		notifyStopTyping: 'plugins.shoutbox.notifyStopTyping',
		getOriginalShout: 'plugins.shoutbox.getOriginalShout',
		saveSettings: 'plugins.shoutbox.saveSetting',
		getSettings: 'plugins.shoutbox.getSettings',
		getUsers: 'user.loadMore',
		getUserStatus: 'user.isOnline',
		wobble: 'plugins.shoutbox.wobble'
	};

	var Events = {
		onUserStatusChange: Messages.getUserStatus,
		onReceive: 'event:shoutbox.receive',
		onDelete: 'event:shoutbox.delete',
		onEdit: 'event:shoutbox.edit',
		onStartTyping: 'event:shoutbox.startTyping',
		onStopTyping: 'event:shoutbox.stopTyping',
		onWobble: 'event:shoutbox.wobble'
	};

	var Handlers = {
		onReceive: function(data) {
			var shoutPanel = Shoutbox.base.getShoutPanel();

			if (shoutPanel.length > 0) {
				Shoutbox.base.addShout(data, shoutPanel);
				if (data.fromuid !== app.uid) {
					Shoutbox.utils.notify(data);
				}
			}
		},
		onDelete: function(data) {
			var selector = $('[data-sid="' + data.sid + '"]'),
				par = selector.parents('[data-uid]');

			if (par.find('[data-sid]').length === 1) {
				par.remove();
			} else {
				selector.remove();
			}
			if (data.sid === Shoutbox.vars.editing) {
				Shoutbox.actions.finishEdit(Shoutbox.base.getShoutPanel());
			}
		},
		onEdit: function(data) {
			data.content = '<abbr title="edited">' + data.content + '</abbr>';
			$('[data-sid="' + data.sid + '"]').html(Shoutbox.utils.parseShout(data, true));
		},
		onUserStatusChange: function(err, data) {
			Shoutbox.base.updateUserStatus(data.uid, data.status, Shoutbox.base.getShoutPanel());
		},
		onStartTyping: function(data) {
			$('[data-uid="' + data.uid + '"]').find('.shoutbox-shout-typing').addClass('isTyping');
		},
		onStopTyping: function(data) {
			$('[data-uid="' + data.uid + '"]').find('.shoutbox-shout-typing').removeClass('isTyping');
		},
		onWobble: function(data) {
			Shoutbox.utils.playSound('wobblysausage');
		},
		defaultSocketHandler: function(message) {
			this.message = message;
			var self = this;

			return function (data, callback) {
				if (typeof data === 'function') {
					callback = data;
					data = null;
				}

				socket.emit(self.message, data, callback);
			};
		}
	};

	Shoutbox.sockets = {
		messages: Messages,
		events: Events,
		initialize: function() {
			for (var e in Events) {
				if (Events.hasOwnProperty(e)) {
					if (socket.listeners(Events[e]).length === 0) {
						socket.on(Events[e], Handlers[e]);
					}
				}
			}

			for (var m in Messages) {
				if (Messages.hasOwnProperty(m)) {
					Shoutbox.sockets[m] = new Handlers.defaultSocketHandler(Messages[m]);
				}
			}
		}
	};
})(window.Shoutbox);