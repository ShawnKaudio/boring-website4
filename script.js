document.addEventListener('DOMContentLoaded', () => {
  const calendarEl = document.getElementById('calendar');
  const calendar = new FullCalendar.Calendar(calendarEl, { initialView: 'dayGridMonth' });
  calendar.render();

  async function loadBookings() {
    // Replace <boring-website4.vercel.app> with your deployed backend
    const resp = await fetch('https://<boring-website4.vercel.app>/api/bookings');
    const bookings = await resp.json();

    calendar.getEvents().forEach(event => event.remove());
    const bookedDates = {};

    bookings.forEach(b => {
      const startDate = new Date(b.start);
      const endDate = new Date(b.end);
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const key = d.toISOString().split('T')[0];
        if (!bookedDates[key] || (b.status === 'confirmed')) bookedDates[key] = b.status;
      }
    });

    // Add booked events
    Object.keys(bookedDates).forEach(date => {
      calendar.addEvent({
        title: bookedDates[date] === 'confirmed' ? 'Booked' : 'Tentative',
        start: date,
        end: new Date(new Date(date).getTime() + 24*60*60*1000),
        color: bookedDates[date] === 'confirmed' ? 'red' : 'yellow'
      });
    });

    // Highlight available days in green
    const startMonth = new Date(calendar.view.currentStart);
    const endMonth = new Date(calendar.view.currentEnd);
    for (let d = new Date(startMonth); d < endMonth; d.setDate(d.getDate() + 1)) {
      const key = d.toISOString().split('T')[0];
      if (!bookedDates[key]) {
        calendar.addEvent({
          start: key,
          end: new Date(d.getTime() + 24*60*60*1000),
          display: 'background',
          backgroundColor: 'green'
        });
      }
    }
  }

  loadBookings();
  setInterval(loadBookings, 60000); // refresh every 60s

  const form = document.getElementById('bookingForm');
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const formData = {
      name: form.name.value,
      email: form.email.value,
      start: form.start.value,
      end: form.end.value,
      status: form.status.value
    };

    await fetch('https://<boring-website4.vercel.app>/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    alert('Booking request sent! Check your email for approval link.');
    form.reset();
    loadBookings();
  });
});
