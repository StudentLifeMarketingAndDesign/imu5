<?php
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
class WhoDoesWhatHolder_Controller extends Blog_Controller {

	/**
	 * An array of actions that can be accessed via a request. Each array element should be an action name, and the
	 * permissions or conditions required to allow the user to access it.
	 *
	 * <code>
	 * array (
	 *     'action', // anyone can access this action
	 *     'action' => true, // same as above
	 *     'action' => 'ADMIN', // you must have ADMIN permissions to access this action
	 *     'action' => '->checkAction' // you can only access this action if $this->checkAction() returns true
	 * );
	 * </code>
	 *
	 * @var array
	 */
	private static $allowed_actions = array (
	);

	public function init() {
		parent::init();

	}

}