<?php

use SilverStripe\Forms\TextField;
use SilverStripe\Forms\HTMLEditor\HTMLEditorField;
use SilverStripe\Blog\Model\BlogPost;

class WhoDoesWhatPage extends BlogPost {

	private static $db = array(
		"OfficeName" => "Text",
		"OfficeLocation" => "Text",
		"PhoneNumber" => "Varchar",
		"EmailAddress" => "Text",
		"Website" => "Text",
		"AdditionalInfo" => "HTMLText",
		
	);

	private static $has_one = array(
	
	);

	private static $has_many = array(
	);
	
	static $singular_name = 'Who Does What Page';
	
	static $plural_name = 'Who Does What Pages';
	/* This is a GLOBAL change that should happen on all CISL sites */
	
	public function getCMSFields(){
		$fields = parent::getCMSFields();
		
		$fields->addFieldToTab( 'Root.Main', new TextField("OfficeName", "Office Name"));
		$fields->addFieldToTab( 'Root.Main', new TextField("OfficeLocation", "Office Location"));
		$fields->addFieldToTab( 'Root.Main', new TextField("PhoneNumber", "Phone Number"));
		$fields->addFieldToTab( 'Root.Main', new TextField("EmailAddress", "Email Address"));
		$fields->addFieldToTab( 'Root.Main', new TextField("Website", "Website"));
		$fields->addFieldToTab( 'Root.Main', new HTMLEditorField("AdditionalInfo", "Additional Info"));

		
		$fields->removeByName('Content');
	    $fields->removeByName('StoryBy');
	    $fields->removeByName('StoryByEmail');
		$fields->removeByName('StoryByTitle');
		$fields->removeByName('StoryByDept');
		$fields->removeByName('PhotosBy');
		$fields->removeByName('ExternalURL');
		$fields->removeByName('PhotosByEmail');
		$fields->removeByName('BackgroundImage');		
		
		
		//$f->removeByName("Content");
		//$gridFieldConfig = GridFieldConfig_RecordEditor::create();
		//$gridFieldConfig->addComponent(new GridFieldSortableRows('SortOrder'));
		
		
		/*$gridField = new GridField("StaffTeam", "Staff Teams", StaffTeam::get(), GridFieldConfig_RecordEditor::create());
		$f->addFieldToTab("Root.Main", $gridField); // add the grid field to a tab in the CMS	*/
		return $fields;
	}
}