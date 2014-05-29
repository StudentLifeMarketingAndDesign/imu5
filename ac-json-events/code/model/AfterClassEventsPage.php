<?php
class AfterClassEventsPage extends Page {

	private static $db = array(
		"DisplayCategory" => "Int"
	);

	private static $has_one = array(

	);
	private static $icon = "ac-json-events/images/calendar";	
	private static $allowed_children = array('HomePageSlider');
	
	function getCMSFields() {
		$fields = parent::getCMSFields();
		$fields->addFieldToTab("Root.Main", new AfterClassCategoryDropdownField('DisplayCategory', 'Display the following category of AC events on this page'), "Content");
		return $fields;
	}

}
class AfterClassEventsPage_Controller extends Page_Controller {

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

}
?>