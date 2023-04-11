import React from 'react';
import { Badge, Calendar } from 'antd';

function CalendarData(year, month, day, type, content) {
  this.year = year;
  this.month = month;
  this.day = day;
  this.listData = [{ "type": type, "content": content }]
}

function MyCalendar({ logs }) {
  const [calendarData, setCalendarData] = React.useState([]);
  React.useEffect(() => {
    buildCalendarData();
  }, [logs])
  const buildCalendarData = () => {
    const data = logs.map((log) => {
      const date = new Date(log.date);
      return new CalendarData(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDay(), 'success', `${log.distance}m in ${log.duration}mins`);
    })
    setCalendarData(data);
  }
  const getListData = (value) => {
    let listData;
    [value.date()].map((date) => {
      calendarData.map((data) => {
        if (parseInt(value.year()) === parseInt(data.year) && parseInt(value.month()) === parseInt(data.month) && parseInt(date) === parseInt(data.day)) {
          listData = data.listData;
        }
      })
    })

    return listData || [];
  };

  const dateCellRender = (value) => {
    const listData = getListData(value);
    return (
      <ul className="events">
        {listData.map((item) => (
          <li key={item.content}>
            <Badge status={item.type} text={item.content} />
          </li>
        ))}
      </ul>
    );
  };

  return <Calendar dateCellRender={dateCellRender} />;
};

export default MyCalendar;