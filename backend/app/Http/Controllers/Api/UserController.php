<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        $users = User::select('id', 'name', 'email', 'role', 'created_at')
            ->orderBy('name')
            ->get();

        return response()->json($users);
    }

public function updateRole(Request $request, $id)
{
    $request->validate([
        'role' => 'required|in:user,admin',
    ]);

    $user = User::findOrFail($id);
    $user->role = $request->role;
    $user->save();

    return response()->json([
        'message' => 'User role updated successfully.',
        'user' => $user,
    ]);
}
public function destroy($id)
{
    $user = \App\Models\User::find($id);

    if (!$user) {
        return response()->json([
            'message' => 'User not found.'
        ], 404);
    }

    if (auth()->id() == $user->id) {
        return response()->json([
            'message' => 'You cannot delete your own account.'
        ], 403);
    }

    if ($user->role === 'admin') {
        return response()->json([
            'message' => 'Admin user cannot be deleted.'
        ], 403);
    }

    \App\Models\Registration::where('user_id', $user->id)->delete();

    $user->delete();

    return response()->json([
        'message' => 'User deleted successfully.'
    ]);
}
}