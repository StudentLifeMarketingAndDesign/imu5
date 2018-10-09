<?php

use SilverStripe\Forms\TextField;
use SilverStripe\Blog\Model\Blog;

class WhoDoesWhatHolder extends Blog {

	private static $db = array(
		"facebook_iframe" => "HTMLText",
		"twitter_iframe" => "HTMLText",
	);

	private static $has_one = array(
	
	);

	private static $has_many = array(
	);
	
	private static $singular_name = 'Who Does What Holder';
	
	private static $plural_name = 'Who Does What Holders';

	private static $allowed_children = array("WhoDoesWhatPage");
	
	public function getCMSFields(){
		$f = parent::getCMSFields();
		//$f->removeByName("Content");
		//$gridFieldConfig = GridFieldConfig_RecordEditor::create();
		//$gridFieldConfig->addComponent(new GridFieldSortableRows('SortOrder'));
		$f->addFieldToTab('Root.Main', new TextField('facebook_iframe','Facebook iFrame Code'));
		$f->addFieldToTab('Root.Main', new TextField('twitter_iframe','Twitter iFrame Code'));
		
		/*$gridField = new GridField("StaffTeam", "Staff Teams", StaffTeam::get(), GridFieldConfig_RecordEditor::create());
		$f->addFieldToTab("Root.Main", $gridField); // add the grid field to a tab in the CMS	*/
		return $f;
	}
}
