var vec3()
direction_this, 
direction_target, 
direction_pitchnode, 
position_firstrotation, 
position_target, 
temp;

var Quaternion()
rotation, 
rotation_pitch;

      direction_this = Ogre::Vector3::NEGATIVE_UNIT_Z;
      direction_target = temp = m_scene.m_transform_sys->position_relative_to(target, *this);

      // put them in the same y plane
      temp.y = 0; // we just want yaw rotation first

      rotation = direction_this.getRotationTo(temp);

      direction_pitchnode =  rotation * Ogre::Vector3::NEGATIVE_UNIT_Z;

      // get yet another rotation, now consider the y difference
      rotation_pitch = direction_pitchnode.getRotationTo(direction_target);
        
        auto orientation = m_scene.m_transform_sys->orientation(*this);

      auto lerp = Ogre::Quaternion::nlerp(time, orientation, rotation_pitch * rotation);

      m_scene.m_transform_sys->orientation(*this, lerp);