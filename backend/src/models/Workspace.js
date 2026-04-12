// const mongoose = require('mongoose');

// const workspaceSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//       trim: true,
//     },
//     description: {
//       type: String,
//       default: '',
//     },
//     ownerId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: 'User',
//       required: true,
//     },
//     members: [
//       {
//         userId: {
//           type: mongoose.Schema.Types.ObjectId,
//           ref: 'User',
//           required: true,
//         },
//         role: {
//           type: String,
//           enum: ['pm', 'collaborator'],
//           default: 'collaborator',
//         },
//         joinedAt: {
//           type: Date,
//           default: Date.now,
//         },
//       },
//     ],
//     githubConfig: {
//       repoOwner: { type: String, trim: true },
//       repoName: { type: String, trim: true },
//       repoId: { type: String },
//       linkedBy: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'User',
//       },
//       linkedAt: {
//         type: Date,
//       },
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// /**
//  * Pre-save middleware: Ensure the user who links a GitHub repository
//  * to this workspace is automatically assigned the 'PM' role
//  */
// workspaceSchema.pre('save', function (next) {
//   const workspace = this;

//   // If GitHub config has been modified and has a linkedBy user
//   if (workspace.githubConfig?.linkedBy) {
//     const linkedByUserId = workspace.githubConfig.linkedBy.toString();

//     // Find if the linkedBy user is already a member
//     const memberIndex = workspace.members.findIndex(
//       m => m.userId.toString() === linkedByUserId
//     );

//     if (memberIndex !== -1) {
//       // User is a member, ensure they have PM role
//       if (workspace.members[memberIndex].role !== 'pm') {
//         workspace.members[memberIndex].role = 'pm';
//         console.log(
//           `[Workspace.pre-save] Automatically assigned PM role to user ${linkedByUserId} for GitHub repo linking`
//         );
//       }
//     } else {
//       // User is not a member yet, add them as PM
//       workspace.members.push({
//         userId: workspace.githubConfig.linkedBy,
//         role: 'pm',
//         joinedAt: new Date(),
//       });
//       console.log(
//         `[Workspace.pre-save] Added user ${linkedByUserId} as PM member when linking GitHub repo`
//       );
//     }
//   }

//   next();
// });

// module.exports = mongoose.model('Workspace', workspaceSchema);





const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        role: {
          type: String,
          enum: ['pm', 'collaborator'],
          default: 'collaborator',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    githubConfig: {
      repoOwner: { type: String, trim: true },
      repoName: { type: String, trim: true },
      repoId: { type: String },
      linkedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
      linkedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Removed the pre-validation that forced PM roles, allowing controllers to apply strict Github-based roles.

module.exports = mongoose.model('Workspace', workspaceSchema);