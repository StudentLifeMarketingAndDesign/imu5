$Header
<main class="main-content__container" id="main-content__container">

	<!-- Background Image Feature -->
	<% if $BackgroundImage %>
		<% include FeaturedImage %>
	<% end_if %>
	$Breadcrumbs

<% if not $BackgroundImage %>
	<div class="column row">
		<div class="main-content__header">
			<h1>$Title</h1>
		</div>
	</div>
<% end_if %>

$BlockArea(BeforeContent)

<div class="row">

	<article role="main" class="main-content main-content--with-padding <% if $Children || $Menu(2) || $SidebarBlocks ||  $SidebarView.Widgets %>main-content--with-sidebar<% else %>main-content--full-width<% end_if %>">
		$BlockArea(BeforeContentConstrained)
		<div class="main-content__text">
			$Content
		</div>
		$BlockArea(AfterContentConstrained)
		$Form
		<ul class="justify MeetingRoomList">
				<% loop $Children %>

					<li class="item">
						<a href="$Link">
							<img src="$SlideshowImage1.croppedImage(300,200).URL" alt="$Title">
							<h3 class="title">$Title</h3>

							<p class="room-capacity">
							<% if $DisplayCapacity %>
								<span class="capacity"><strong>Capacity: </strong>$DisplayCapacity</span>
							<% end_if %>
							<% if $Number %>
								<span class="room"><strong>Room #</strong>$Number</span>
							<% end_if %>
							</p>
							

							<!--
							<% if $TablesAndChairsCapacity %>$TablesAndChairsCapacity<% end_if %>
							<% if $RoundedTablesCapacity %>$RoundedTablesCapacity<% end_if %>
							<% if $TheaterCapacity %>$TheaterCapacity<% end_if %>
							<% if $ClassroomCapacity %>$ClassroomCapacity<% end_if %>
							<% if $UshapeCapacity %>$UshapeCapacity<% end_if %>
							<% if $BoardroomCapacity %>$BoardroomCapacity<% end_if %>
							-->
							
						 </a>
					</li>&nbsp;

				<% end_loop %>
					<li class="item filler"></li>
			</ul>
	</article>
	<aside class="sidebar dp-sticky">
		<% include SideNav %>
		<% if $SideBarView %>
			$SideBarView
		<% end_if %>
		$BlockArea(Sidebar)
	</aside>
</div>
$BlockArea(AfterContent)

</main>