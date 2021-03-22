(function($) {
	$(document).on('click', 'a.ajax-load-page-link', function (e) {
		e.preventDefault();
		var $this = $(e.currentTarget);

		// if parent is not active then get hash, or else page is assumed to be loaded
		//if (!$this.parent().hasClass("active") && !$this.attr('target')) {
		if (!$this.attr('target')) {

			// update window with hash
			// you could also do here:  thisDevice === "mobile" - and save a little more memory

			if (myapp_config.root_.hasClass('mobile-view-activated')) {
				myapp_config.root_.removeClass('hidden-menu');
				$('html').removeClass("hidden-menu-mobile-lock");
				window.setTimeout(function () {
					if (window.location.search) {
						window.location.href =
							window.location.href.replace(window.location.search, '')
							.replace(window.location.hash, '') + '#' + $this.attr('href');
					} else {
						window.location.hash = $this.attr('href');
					}
				}, 150);
				// it may not need this delay...
			} else {
				if (window.location.search) {
					window.location.href =
						window.location.href.replace(window.location.search, '')
						.replace(window.location.hash, '') + '#' + $this.attr('href');
				} else {
					window.location.hash = $this.attr('href');
				}
			}
		}

	});

}(jQuery));



var AjaxFn = function($data,$selector) {
    	if ( $data.status == 'ok' ) {

    		var cmds = $data.cmds;
    		for(var i = 0, len = cmds.length; i < len; i++){
			    //console.log( cmds[i] );
			    switch (cmds[i].command) {
				  case "alert":
				    //Swal.fire(cmds[i].text);
				    alert(cmds[i].text);
				    break;
				  case "message":
				    toastr[cmds[i].type](cmds[i].text);
				    break;
				  case "insert":
				   $(cmds[i].selector).insert(cmds[i].data);
				    break;
				  case "replaceWith":
				    $(cmds[i].selector).replaceWith(cmds[i].data);
				    break;
				  case "html":
				    $(cmds[i].selector).html(cmds[i].data);
				    break;
				  case "prepend":
				    $(cmds[i].selector).prepend(cmds[i].data);
				    break;
				  case "append":
				    $(cmds[i].selector).append(cmds[i].data);
				    break;
				  case "after":
				    $(cmds[i].selector).after(cmds[i].data);
				    break;
				  case "before":
				    $(cmds[i].selector).before(cmds[i].data);
				    break;
				  case "remove":
				    $(cmds[i].selector).remove();
				    break;
				  case "changed":
				    $(cmds[i].selector).changed(cmds[i].data);
				    break;
				  case "css":
				    $(cmds[i].selector).css(cmds[i].data);
				    break;
				  case "addClass":
				    $(cmds[i].selector).addClass(cmds[i].data);
				    break;
				  case "removeClass":
				    $(cmds[i].selector).removeClass(cmds[i].data);
				    break;
				  case "invoke":
				    //$("body").append(cmds[i].script);
				    //$(".root-javascript").remove();
				    Command:{eval(cmds[i].script)};
				    break;
				  case "data":
				    $(cmds[i].selector).data(cmds[i].name, cmds[i].value);
				    break;
				  case "add_css":
				    // Add the styles in the normal way.
				    $('head').prepend(cmds[i].data);
				    // Add imports in the styles using the addImport method if available.
				    var match, importMatch = /^@import url\("(.*)"\);$/igm;
				    if (document.styleSheets[0].addImport && importMatch.test(cmds[i].data)) {
				      importMatch.lastIndex = 0;
				      while (match = importMatch.exec(cmds[i].data)) {
				        document.styleSheets[0].addImport(match[1]);
				      }
				    }
				    break;
				    
				}
			}

    		$selector.removeClass('ajax-progress');
    		$selector.attr("disabled", false);
    	} else {
    		alert('AJAX可能出错！');
    		$selector.removeClass('ajax-progress');
    		$selector.attr("disabled", false);
    	}

    	$("body").removeClass("modal-open swal2-shown"); 
    	$("body").attr("style","");
    };


(function($) {
	$.fn.callFN = function($method,$arguments) {  
		return this.each(function() {
			var $this = $(this);
			//$this.$method('123456');

			$this[0].apply($method);
		});
	};
})(jQuery);



$(document).ready( function () {

    


    //$('body').callFN('alert');

    jQuery.validator.addMethod("vapath", function(value, element){
    	if ( value ) {
			if ( $(element).attr("data-vapath") == 1 ) {
				return true;
			} else {
				return false;
			}
    	} else {
    		return true;
    	}
	    

	},'输入或修改URL路径，请检查URL并更改后再提交！'); 




    $(document).on('click', '[data-ajax="form"]', function (e) {
		e.preventDefault();


		


			var this_selector = $(this);
			var form_id = this_selector.attr('data-form');
			var form_data = $( form_id ).serializeArray();
			var form_url = this_selector.attr('data-ajax-url');
			var submit_message = this_selector.attr('data-ajax-message');
			//alert(form_id);
			$(form_id).validate({
				rules: {
		            path: {
		                vapath: true
		            }
		        }
			});

			if ($(form_id).valid()) {
				Swal.fire({
				  title: '确定提交此操作吗?',
				  text: submit_message,
				  icon: 'warning',
				  allowOutsideClick:false,
				  heightAuto:false,
				  showCancelButton: true,
				  confirmButtonColor: '#3085d6',
				  cancelButtonColor: '#d33',
				  confirmButtonText: '确定保存!',
				  showLoaderOnConfirm: true,
				  preConfirm: () => { 

				  	var data_array = {};

				  	//表单数据转JSON
				    $.map(form_data, function (n, i) {
				      data_array[n['name']] = n['value'];
				    });

					var options = {
					    method: 'POST',
					    headers: { "Content-Type": "application/json", 'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
					    body: JSON.stringify(data_array),
					}
					return fetch(form_url,options)
					.then(res => res.json())
		    		.then(res => AjaxFn(res,this_selector));

				  }
				})
				
			}
		
		
	});

	$(document).on('click', '[data-ajax="link"]', function (e) {
		e.preventDefault();
		e.stopPropagation();
		var this_selector = $(this);
		var ajax_data = this_selector.attr('data-ajax-data');
		var ajax_url = this_selector.attr('data-ajax-url');
		var submit_message = this_selector.attr('data-ajax-message');

		Swal.fire({
		  title: '确定提交此操作吗?',
		  text: submit_message,
		  icon: 'warning',
		  allowOutsideClick:false,
		  heightAuto:false,
		  showCancelButton: true,
		  confirmButtonColor: '#3085d6',
		  cancelButtonColor: '#d33',
		  confirmButtonText: '确定!',
		  showLoaderOnConfirm: true,
		  preConfirm: () => { 

			var requestObject = {'ajax_data': ajax_data};

			var options = {
			    method: 'POST',
			    headers: { "Content-Type": "application/json",'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')},
			    body: JSON.stringify(requestObject),
			}
			return fetch(ajax_url,options)
			.then(res => res.json())
    		.then(res => AjaxFn(res,this_selector));

		  }
		});



		
	});

	toastr.options = {
	  "closeButton": false,
	  "debug": false,
	  "newestOnTop": false,
	  "progressBar": true,
	  "positionClass": "toast-top-center",
	  "preventDuplicates": false,
	  "onclick": null,
	  "showDuration": "300",
	  "hideDuration": "1000",
	  "timeOut": "3000",
	  "extendedTimeOut": "1000",
	  "showEasing": "swing",
	  "hideEasing": "linear",
	  "showMethod": "fadeIn",
	  "hideMethod": "fadeOut"
	};


	
	
 });


jQuery.loadScript = function (url, callback) {
    jQuery.ajax({
        url: url,
        dataType: 'script',
        success: callback,
        async: true
    });
}