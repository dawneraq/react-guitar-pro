import { nanoid } from 'nanoid';

import { useDocument } from './useDocument';
import * as actionTypes from '../actionTypes';

// Similar to Redux's bound action creators,
// so that state-dependent dispatch logic can exist outside of components
export const useActions = (state, dispatch) => {
  const {
    tracks,
    durations,
    measures,
    selectedTrackNumber,
    selectedTrack,
    selectedMeasureNumber,
    selectedDuration,
    selectedStringNumber,
  } = useDocument(state);

  const addTrack = (trackToAdd) => {
    let newTrackId = nanoid();
    // TODO Turn ID array generation into a function
    let measureIds =
      tracks.length === 0
        ? [nanoid()]
        : tracks[0].measures.map((measure) => nanoid());
    let durationIds =
      tracks.length === 0
        ? [nanoid()]
        : tracks[0].measures.map((measure) => nanoid());

    dispatch({
      type: actionTypes.ADD_TRACK,
      id: newTrackId,
      measures: measureIds,
      durationIds: durationIds,
      durationLength: selectedDuration?.length,
      ...trackToAdd,
    });

    return {
      newTrackId: newTrackId,
      durationIdToSelect: durationIds[selectedMeasureNumber],
    };
  };

  const deleteTrack = () => {
    // If a track that's not last is being deleted,
    if (selectedTrackNumber < tracks.length - 1) {
      const nextTracksFirstDurationAtSelectedMeasureNumber = durations.find(
        (duration) =>
          duration.id ===
          measures.find(
            (measure) =>
              measure.id ===
              tracks[selectedTrackNumber + 1].measures[selectedMeasureNumber]
          ).durations[0]
      );

      // Select first duration of next track's measure at selectedMeasureNumber
      dispatch({
        type: actionTypes.SELECT_DURATION,
        durationId: nextTracksFirstDurationAtSelectedMeasureNumber.id,
      });
    }
    // Otherwise, select first duration of previous track's measure at selectedMeasureNumber
    else if (selectedTrackNumber !== 0) {
      const previousTracksFirstDurationAtSelectedMeasureNumber = durations.find(
        (duration) =>
          duration.id ===
          measures.find(
            (measure) =>
              measure.id ===
              tracks[selectedTrackNumber - 1].measures[selectedMeasureNumber]
          ).durations[0]
      );

      dispatch({
        type: actionTypes.SELECT_TRACK,
        trackNumber: selectedTrackNumber - 1,
      });
      dispatch({
        type: actionTypes.SELECT_DURATION,
        durationId: previousTracksFirstDurationAtSelectedMeasureNumber.id,
      });
    }

    dispatch({
      type: actionTypes.DELETE_TRACK,
      trackId: tracks[selectedTrackNumber].id,
    });
  };

  const selectPreviousString = () => {
    dispatch({
      type: actionTypes.SELECT_STRING,
      stringNumber:
        selectedStringNumber === 0
          ? selectedTrack?.tuning.length - 1
          : selectedStringNumber - 1,
    });
  };

  const selectNextString = () => {
    dispatch({
      type: actionTypes.SELECT_STRING,
      stringNumber: (selectedStringNumber + 1) % selectedTrack?.tuning.length,
    });
  };

  const shortenDuration = (durationId) => {
    dispatch({
      type: actionTypes.SET_DURATION_LENGTH,
      durationId: durationId,
      newLength: selectedDuration?.length / 2,
    });
  };

  const lengthenDuration = (durationId) => {
    dispatch({
      type: actionTypes.SET_DURATION_LENGTH,
      durationId: durationId,
      newLength: selectedDuration?.length * 2,
    });
  };

  return {
    addTrack,
    deleteTrack,
    selectPreviousString,
    selectNextString,
    shortenDuration,
    lengthenDuration,
  };
};