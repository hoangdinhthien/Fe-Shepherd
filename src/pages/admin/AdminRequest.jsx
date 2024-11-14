import React, { useEffect, useState } from 'react';
import RequestAPI from '../../apis/admin/request_api';
import { Pie } from 'react-chartjs-2';

const AdminRequest = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await RequestAPI.getAllRequests();
        console.log('Fetched data:', data);
        // Ensure the data is an array before setting it
        setRequests(Array.isArray(data['result']) ? data['result'] : []);
      } catch (error) {
        console.error('Failed to fetch requests:', error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, []);

  if (loading) return <p>Loading...</p>;

  // Log requests before using reduce
  console.log('Requests before reduce:', requests);

  // Ensure requests is an array before calling .reduce()
  const statusCounts = Array.isArray(requests)
    ? requests.reduce(
        (acc, request) => {
          if (request.isAccepted === true) acc.approved += 1;
          else if (request.isAccepted === false) acc.rejected += 1;
          else acc.pending += 1;
          return acc;
        },
        { approved: 0, rejected: 0, pending: 0 }
      )
    : { approved: 0, rejected: 0, pending: 0 };

  const pieData = {
    labels: ['Chấp nhận', 'Từ chối', 'Đang xử lý'],
    datasets: [
      {
        data: [
          statusCounts.approved,
          statusCounts.rejected,
          statusCounts.pending,
        ],
        backgroundColor: ['#4caf50', '#f44336', '#ff9800'],
      },
    ],
  };

  const pieOptions = {
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 20, // Add spacing between the chart and the legend items
        },
      },
    },
    responsive: true,
  };

  return (
    <div style={{ width: '80%', margin: 'auto', paddingTop: '20px' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '20px',
        }}
      >
        <div
          style={{
            width: '600px', // Adjust width to make the box wider
            height: '320px',
            padding: '20px',
            backgroundColor: '#C0C0C0',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Pie data={pieData} options={pieOptions} />
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f0f0f0' }}>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Title</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>
              Content
            </th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>Status</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>To</th>
            <th style={{ border: '1px solid #ddd', padding: '8px' }}>
              Create Date
            </th>
          </tr>
        </thead>
        <tbody>
          {requests.map((request) => (
            <tr key={request.id}>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {request.title}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {request.content}
              </td>
              <td
                style={{
                  border: '1px solid #ddd',
                  padding: '8px',
                  color:
                    request.isAccepted === true
                      ? 'green'
                      : request.isAccepted === false
                      ? 'red'
                      : 'orange',
                  fontWeight: 'bold',
                }}
              >
                {request.isAccepted === true
                  ? 'Chấp nhận'
                  : request.isAccepted === false
                  ? 'Từ chối'
                  : 'Đang xử lý'}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {request.to}
              </td>
              <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                {new Date(request.createDate).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminRequest;
