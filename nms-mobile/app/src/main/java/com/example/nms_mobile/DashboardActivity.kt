
package com.example.nms_mobile

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material3.Text
import androidx.compose.material3.MaterialTheme

class DashboardActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MaterialTheme {
                Text("Dashboard placeholder (Compose-only)")
            }
        }
    }
}

//package com.example.nms_mobile
//
//import android.content.Intent
//import android.os.Bundle
//import android.view.MenuItem
//import androidx.core.view.GravityCompat
//import com.google.android.material.navigation.NavigationView
//
//
//class DashboardActivity : AppCompatActivity(), NavigationView.OnNavigationItemSelectedListener {
//    private lateinit var binding: ActivityDashboardBinding
//    private lateinit var userEmail: String
//
////
//    override fun onCreate(savedInstanceState: Bundle?) {
//        super.onCreate(savedInstanceState)
//        binding = ActivityDashboardBinding.inflate(layoutInflater)
//        setContentView(binding.root)
//
//        userEmail = intent.getStringExtra("USER_EMAIL") ?: "user@example.com"
//
//        setupToolbar()
//        setupNavigationDrawer()
//
//        // Load default fragment
//        if (savedInstanceState == null) {
//            loadFragment(DashboardFragment())
//            binding.navView.setCheckedItem(R.id.nav_dashboard)
//        }
//    }
//
//    private fun setupToolbar() {
//        setSupportActionBar(binding.toolbar)
//        supportActionBar?.setDisplayHomeAsUpEnabled(true)
//        supportActionBar?.title = "Dashboard"
//    }
//
//    private fun setupNavigationDrawer() {
//        val toggle = ActionBarDrawerToggle(
//            this, binding.drawerLayout, binding.toolbar,
//            R.string.navigation_drawer_open, R.string.navigation_drawer_close
//        )
//        binding.drawerLayout.addDrawerListener(toggle)
//        toggle.syncState()
//
//        binding.navView.setNavigationItemSelectedListener(this)
//    }
//
//    override fun onNavigationItemSelected(item: MenuItem): Boolean {
//        when (item.itemId) {
//            R.id.nav_dashboard -> {
//                loadFragment(DashboardFragment())
//                supportActionBar?.title = "Dashboard"
//            }
//
//            R.id.nav_users -> {
//                loadFragment(UsersFragment())
//                supportActionBar?.title = "Users"
//            }
//
//            R.id.nav_settings -> {
//                loadFragment(SettingsFragment())
//                supportActionBar?.title = "Settings"
//            }
//
//            R.id.nav_logout -> {
//                logout()
//                return true
//            }
//        }
//        binding.drawerLayout.closeDrawer(GravityCompat.START)
//        return true
//    }
//
//    private fun loadFragment(fragment: Fragment) {
//        supportFragmentManager.beginTransaction()
//            .replace(R.id.fragment_container, fragment)
//            .commit()
//    }
//
//    private fun logout() {
//        val intent = Intent(this, MainActivity::class.java)
//        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
//        startActivity(intent)
//        finish()
//    }
//    override fun onBackPressed() {
//        if (binding.drawerLayout.isDrawerOpen(GravityCompat.START)) {
//            binding.drawerLayout.closeDrawer(GravityCompat.START)
//        } else {
//            super.onBackPressed()
//        }
//    }
//}
//
