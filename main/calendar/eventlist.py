calendar_list_entry = service.calendarList().get(calendarId='calendarId').execute()

print calendar_list_entry['summary']

page_token = None
while True:
  calendar_list = service.calendarList().list(pageToken=page_token).execute()
  for calendar_list_entry in calendar_list['items']:
    print calendar_list_entry['summary']
  page_token = calendar_list.get('nextPageToken')
  if not page_token:
    break