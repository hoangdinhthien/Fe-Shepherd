import React, { useState } from 'react';
import activityAPI from '../apis/activity/activity_api';

const CreateActivity = () => {
  const [formData, setFormData] = useState({
    activityName: '',
    description: '',
    fromDate: '',
    toDate: '',
    totalCost: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', isError: false });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const activityData = {
        activityName: formData.activityName,
        description: formData.description,
        fromDate: formData.fromDate,
        toDate: formData.toDate,
        status: 1,
        totalCost: parseFloat(formData.totalCost),
      };

      await activityAPI.create(activityData);

      setMessage({ text: 'Activity created successfully!', isError: false });
      setFormData({
        activityName: '',
        description: '',
        fromDate: '',
        toDate: '',
        totalCost: '',
      });
    } catch (error) {
      setMessage({ text: error.message, isError: true });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='p-6 max-w-6xl mx-auto'>
      <h1 className='text-3xl font-bold mb-8 text-gray-800'>
        Create New Activity
      </h1>

      {message.text && (
        <div
          className={`p-4 mb-4 rounded-lg ${
            message.isError
              ? 'bg-red-100 text-red-700'
              : 'bg-green-100 text-green-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className='space-y-6'
      >
        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Activity Name
          </label>
          <input
            type='text'
            name='activityName'
            value={formData.activityName}
            onChange={handleChange}
            required
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Description
          </label>
          <textarea
            name='description'
            value={formData.description}
            onChange={handleChange}
            required
            rows='4'
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              Start Date and Time
            </label>
            <input
              type='datetime-local'
              name='fromDate'
              value={formData.fromDate}
              onChange={handleChange}
              required
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-gray-700 mb-2'>
              End Date and Time
            </label>
            <input
              type='datetime-local'
              name='toDate'
              value={formData.toDate}
              onChange={handleChange}
              required
              className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            />
          </div>
        </div>

        <div>
          <label className='block text-sm font-medium text-gray-700 mb-2'>
            Budget
          </label>
          <input
            type='number'
            name='totalCost'
            value={formData.totalCost}
            onChange={handleChange}
            required
            min='0'
            step='0.01'
            className='w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
          />
        </div>

        <button
          type='submit'
          disabled={loading}
          className={`w-full py-3 px-4 bg-blue-600 text-white rounded-lg font-medium 
            ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
        >
          {loading ? 'Creating...' : 'Create Activity'}
        </button>
      </form>
    </div>
  );
};

export default CreateActivity;
