<?php
class MeetingRoomPage extends RoomPage {

	private static $db = array(
	// Generic
	'Number' => 'Varchar',
	// Rates
	'StudentRate' => 'Varchar',
	'FacultyRate' => 'Varchar',
	'GeneralRate' => 'Varchar',
	// Capacities
	'TablesAndChairsCapacity' => 'Varchar',
	'RoundedTablesCapacity' => 'Varchar',
	'TheaterCapacity' => 'Varchar',
	'ClassroomCapacity' => 'Varchar',
	'UshapeCapacity' => 'Varchar',
	'BoardroomCapacity' => 'Varchar',
	// Amenities
	'HasComputer' => 'Boolean',
	'HasEthernetConnection' => 'Boolean',
	'HasProjectorScreen' => 'Boolean',
	'HasDVD' => 'Boolean',
	'HasSpeakers' => 'Boolean',
	'HasMarkerboard'	 => 'Boolean',
	'HasMicrophone'	 => 'Boolean',
	'HasWifi'	 => 'Boolean'
	);

	private static $has_one = array(
	);
	
	}

}
class MeetingRoomPage_Controller extends RoomPage_Controller {

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
