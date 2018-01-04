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

		<article role="main" class="main-content main-content--with-padding <% if $SiteConfig.ShowExitButton %>main-content--with-exit-button-padding<% end_if %> <% if $Children || $Menu(2) || $SidebarBlocks ||  $SidebarView.Widgets %>main-content--with-sidebar<% else %>main-content--full-width<% end_if %>">
			$BlockArea(BeforeContentConstrained)
			<div class="main-content__text">
				<%-- $Content --%>
				
					
					<div class="main-content__text">
						<%-- $Content --%>

						<% with $ActiveHoursPages.First %>
							<h2>$Title</h2>
							<% if $EffectiveStartDate && $EffectiveEndDate %>
								<p><em>Effective from $EffectiveStartDate.NiceUS - $EffectiveEndDate.NiceUS</em></p>
							<% end_if %>

							<div>
								<p>Jump to:</p>
								<ul>
									<% loop $Children %>
										<li><a href="#{$URLSegment}">$Title</a></li>
									<% end_loop %>
								</ul>
							</div>
							<% loop $Children %>
								<h3 id="$URLSegment">$Title</h3>
								<table>
									<tr>
										<th>Day</th>
										<th>Hours</th>
									</tr>
									<tr>
										<td>Monday</td>
										<td>$MonOpenTime.Nice - $MonCloseTime.Nice</td>
									</tr>
									<tr>
										<td>Tuesday</td>
										<td>$TuesOpenTime.Nice - $TuesCloseTime.Nice</td>
									</tr>
									<tr>
										<td>Wednesday</td>
										<td>$WedOpenTime.Nice - $WedCloseTime.Nice</td>
									</tr>
									<tr>
										<td>Thursday</td>
										<td>$ThursOpenTime.Nice - $ThursCloseTime.Nice</td>
									</tr>
									<tr>
										<td>Friday</td>
										<td>$FriOpenTime.Nice - $FriCloseTime.Nice</td>
									</tr>
								</table>
								<% if $Exceptions %>
									<em>Exceptions: $Exceptions </em>
								<% end_if %>
							<% end_loop %>
						<% end_with %>
					</div>					

			
					
			</div>
			$BlockArea(AfterContentConstrained)
			$Form
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