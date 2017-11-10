$('.delete-record').on('click',function(){

	if(confirm('Delete this record?')){
		
		window.location = '/user/delete/'+this.dataset.id;
	}

});