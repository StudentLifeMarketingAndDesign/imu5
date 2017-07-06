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
        		<% if $CurrentTag %>
					<div class="who-does-what-selected-tag">
						
                			
						<p>
						<% _t('VIEWINGTAGGED', 'Departments tagged with') %> '<strong>$CurrentTag.Title</strong>':</p>
					</div>
				<% end_if %>
        			
				<% if $PaginatedList %>
					<% loop $PaginatedList.Sort(Title) %>		
						<section class="who-does-what-section blogSummary" id="{$URLSegment}">
						  <div class="colgroup">
							<div class="who-does-what">
							<h3>
								$MenuTitle
							</h3>
								<% if $OfficeName %><p><span>Office Name:</span> $OfficeName</p><% end_if %>
								<% if $OfficeLocation %><p><span>Location:</span> $OfficeLocation</p><% end_if %>
								<% if $PhoneNumber %><p><span>Phone Number:</span> $PhoneNumber</p><% end_if %>
								<% if $EmailAddress %><p><span>Email:</span> <a href="mailto:$EmailAddress">$EmailAddress</a></p><% end_if %>
								<% if $Website %><p><a class="btn" href="$Website" target="_blank">Visit Website</a></p><% end_if %>
							</div>						
						 </div>	
						<% if Tags %>
						    <div class="who-does-what-section-tags">
							<p>
								Tags:
								<% loop Tags %>
									<a href="$Link" title="View all posts tagged '$Title'" rel="tag">$Title</a><% if not Last %>,<% end_if %>
								<% end_loop %>
							</p>
							</div>
						<% end_if %>
					   </section>
					<hr>	
					<% end_loop %> 
					<p><a href="$Link" class="btn">View All Departments</a></p>	
				<% else %>
					<p><% _t('NOENTRIES', 'There are no departments with this tag.') %></p>
				<% end_if %>

		</div>
		$BlockArea(AfterContentConstrained)
		$Form
		<% if $ShowChildPages %>
			<% include ChildPages %>
		<% end_if %>
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