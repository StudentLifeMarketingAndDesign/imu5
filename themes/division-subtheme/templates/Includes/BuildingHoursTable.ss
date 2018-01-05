<style>table tbody tr.day-$Now.Format(D):nth-child(odd),
	table tbody tr.day-$Now.Format(D):nth-child(even){
		background: rgba(255, 205, 0, 0.46);
		font-weight: bold;
	}</style><p> <% if $Location %> <strong>Location:</strong> $Location <% end_if %> <% if $Location && $Phone %><br><% end_if %> <% if $Phone %> <strong>Phone:</strong> $Phone <% end_if %> </p><table> <% loop $Days %> <tr class="day-$DayShort"><td>$Day</td> <% if $ClosedAllDay %> <td><strong>Closed</strong></td> <% else_if $OpenAllDay %> <td><strong>Open 24 Hours</strong></td> <% else %> <td>$OpenTime.Nice - $CloseTime.Nice</td> <% end_if %> </tr> <% end_loop %> </table> <% if $Exceptions %> <em><strong>Exceptions:</strong> $Exceptions </em> <% end_if %>