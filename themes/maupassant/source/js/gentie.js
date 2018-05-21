var Comments = (function(){

	var getComments = function(url){
		console.log("hello friend!");
		fetch(url).then(function(res) {
		  // res instanceof Response == true.
		  if (res.ok) {
		    res.json().then(function(data) {
		      // console.log(data.content);
		      $(".ds-recent-comments").html(data.content);
		    });
		  } else {
		    console.log("Looks like the response wasn't perfect, got status", res.status);
		  }
		}, function(e) {
		  console.log("Fetch failed!", e);
		});
	}

	return {
		init:function(){
            var USER_NAME = "jverson";
			getComments("http://gentie.jverson.com/getComments?user="+USER_NAME);
		}
	}
})();
$(function(){
	// Comments.init();
})