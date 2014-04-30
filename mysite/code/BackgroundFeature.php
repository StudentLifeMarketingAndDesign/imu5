<?php 

	class BackgroundFeature extends DataObject {
		
		private static $db = array(
			'Tagline' => 'Text'
		);
		
		private static $has_one = array (
			'Image' => 'Image',
			'HomePage' => 'HomePage'
		);

		private static $plural_name = "Background Features";
		
		private static $summary_fields = array (
			"Tagline",
			"Thumbnail"
		);
	  function getThumbnail() {
	      return $this->Image()->CMSThumbnail();
	    }		
		/*function getCMSFields() { 
			$fields = new FieldList(); 
			$fields->push( new TextField( 'Title', 'Title' ));

			return $fields; 
		}*/
		
		
	}